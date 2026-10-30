using System.Diagnostics.Contracts;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Channels;
using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Results;
using Furria.Application.RunningOrders;
using Furria.Core.RunningOrders;
using Furria.Infrastructure.RunningOrders;

namespace Furria.Api.Endpoints.RunningOrders;

public sealed class PostRunningOrderSuggestion
    : Endpoint<PostRunningOrderSuggestionRequest, PostRunningOrderSuggestionResponse>
{
    private const string LinesContentType = "application/x-ndjson";
    private const int LatestProposalOnly = 1;

    private static readonly JsonSerializerOptions LineJson = LineJsonOptions();
    private static readonly byte[] LineBreak = "\n"u8.ToArray();

    private readonly RunningOrderService _runningOrderService;

    public PostRunningOrderSuggestion(RunningOrderService runningOrderService)
    {
        _runningOrderService = runningOrderService;
    }

    public override void Configure()
    {
        Post("events/{eventId}/running-order/suggestion");
        Definition.RequireAnyPermission(RunningOrderKeys.Planners);
    }

    public override async Task HandleAsync(
        PostRunningOrderSuggestionRequest req,
        CancellationToken ct
    )
    {
        var found = Channel.CreateBounded<RunningOrderProposal>(
            new BoundedChannelOptions(LatestProposalOnly)
            {
                FullMode = BoundedChannelFullMode.DropOldest,
                SingleReader = true,
            }
        );
        using var searchStop = CancellationTokenSource.CreateLinkedTokenSource(ct);
        var search = SearchAsync(req, found.Writer, searchStop.Token);
        try
        {
            await foreach (var interim in found.Reader.ReadAllAsync(ct))
                await WriteLineAsync(ToResponse(interim, isFinal: false), ct);
        }
        catch
        {
            await searchStop.CancelAsync();
            await Task.WhenAny(search);
            throw;
        }

        var result = await search;
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await WriteLineAsync(ToResponse(result.Value, isFinal: true), ct);
    }

    private async Task<Result<RunningOrderProposal>> SearchAsync(
        PostRunningOrderSuggestionRequest req,
        ChannelWriter<RunningOrderProposal> found,
        CancellationToken ct
    )
    {
        try
        {
            return await Task.Run(
                () =>
                    _runningOrderService.SuggestAsync(
                        ToCommand(req),
                        proposal => found.TryWrite(proposal),
                        ct
                    ),
                ct
            );
        }
        finally
        {
            found.TryComplete();
        }
    }

    private async Task WriteLineAsync(PostRunningOrderSuggestionResponse line, CancellationToken ct)
    {
        var response = HttpContext.Response;
        if (!response.HasStarted)
        {
            response.StatusCode = StatusCodes.Status200OK;
            response.ContentType = LinesContentType;
            response.Headers.CacheControl = "no-store";
            response.Headers["X-Accel-Buffering"] = "no";
            await response.StartAsync(ct);
        }

        await JsonSerializer.SerializeAsync(response.Body, line, LineJson, ct);
        await response.Body.WriteAsync(LineBreak, ct);
        await response.Body.FlushAsync(ct);
    }

    private static JsonSerializerOptions LineJsonOptions()
    {
        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        options.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));

        return options;
    }

    private static SuggestRunningOrderCommand ToCommand(PostRunningOrderSuggestionRequest req) =>
        new()
        {
            EventId = req.EventId,
            State = new RunningOrderStateCommand
            {
                Lines = [.. req.Lines.Select(line => line.ToDraft())],
                Rules = [.. req.Rules.Select(rule => rule.ToDraft())],
                SuspendedActWishIds = req.SuspendedActWishIds,
            },
            SeedActIds = req.SeedActIds,
            SearchTime = TimeSpan.FromSeconds(req.SearchSeconds),
        };

    private static PostRunningOrderSuggestionResponse ToResponse(
        RunningOrderProposal proposal,
        bool isFinal
    ) =>
        new()
        {
            Final = isFinal,
            Order = [.. proposal.Order.Select(LineKeyText)],
            Moves = [.. proposal.Moves.Select(ToDto)],
            ConflictsBefore = proposal.ConflictsBefore,
            HintsBefore = proposal.HintsBefore,
            ConflictsAfter = proposal.ConflictsAfter,
            HintsAfter = proposal.HintsAfter,
            CostBefore = proposal.CostBefore,
            CostAfter = proposal.CostAfter,
            RoomBefore = proposal.RoomBefore,
            RoomAfter = proposal.RoomAfter,
            Steps =
            [
                .. proposal.Steps.Select(step => new RunningOrderCostStepDto
                {
                    Step = step.Step,
                    Before = step.Before,
                    After = step.After,
                }),
            ],
            Proven = proposal.Proven,
            Holds = [.. proposal.Holds.Select(ToDto)],
            HoldsUnavoidable = proposal.HoldsUnavoidable,
        };

    private static RunningOrderHoldDto ToDto(RunningOrderHold hold) =>
        new()
        {
            Kind = hold.Kind,
            LineKey = hold.Line is { } line ? LineKeyText(line) : null,
            BlockKey = hold.BlockKey,
            RuleIndex = hold.RuleIndex,
            ActWishId = hold.ActWishId,
            ConflictsWithout = hold.ConflictsWithout,
        };

    private static RunningOrderMoveDto ToDto(ProposedMove move) =>
        new()
        {
            LineKey = LineKeyText(move.Line),
            From = move.From,
            To = move.To,
            Resolved =
            [
                .. move.Resolved.Select(resolved => new ResolvedFindingDto
                {
                    Kind = resolved.Kind,
                    LineKeys = [.. resolved.Lines.Select(LineKeyText)],
                }),
            ],
            RoomFor = move.RoomFor,
        };

    [Pure]
    private static string LineKeyText(LineKey key) => $"act:{key.ActId}";
}

public sealed record PostRunningOrderSuggestionRequest
{
    [RouteParam]
    public required int EventId { get; init; }

    public required IReadOnlyList<RunningOrderLineDataDto> Lines { get; init; }

    public required IReadOnlyList<RunningOrderRuleDataDto> Rules { get; init; }

    public required IReadOnlyList<int> SuspendedActWishIds { get; init; }

    public IReadOnlyList<int> SeedActIds { get; init; } = [];

    public int SearchSeconds { get; init; } =
        PostRunningOrderSuggestionValidator.DefaultSearchSeconds;
}

public sealed class PostRunningOrderSuggestionValidator
    : Validator<PostRunningOrderSuggestionRequest>
{
    public const int DefaultSearchSeconds = 5;

    private const int MostLines = 200;
    private const int MostRules = 200;
    private const int FewestSearchSeconds = 1;
    private const int MostSearchSeconds = 60;

    public PostRunningOrderSuggestionValidator()
    {
        RuleFor(request => request.EventId).GreaterThan(0);
        RuleFor(request => request.Lines)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .Must(lines => lines.Count <= MostLines);
        RuleFor(request => request.Rules)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .Must(rules => rules.Count <= MostRules);
        RuleFor(request => request.SuspendedActWishIds).NotNull();
        RuleFor(request => request.SeedActIds)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .Must(seed => seed.Count <= MostLines);
        RuleFor(request => request.SearchSeconds)
            .InclusiveBetween(FewestSearchSeconds, MostSearchSeconds);
    }
}

public sealed record PostRunningOrderSuggestionResponse
{
    public required bool Final { get; init; }

    public required IReadOnlyList<string> Order { get; init; }

    public required IReadOnlyList<RunningOrderMoveDto> Moves { get; init; }

    public required int ConflictsBefore { get; init; }

    public required int HintsBefore { get; init; }

    public required int ConflictsAfter { get; init; }

    public required int HintsAfter { get; init; }

    public required int CostBefore { get; init; }

    public required int CostAfter { get; init; }

    public required int RoomBefore { get; init; }

    public required int RoomAfter { get; init; }

    public required IReadOnlyList<RunningOrderCostStepDto> Steps { get; init; }

    public required bool Proven { get; init; }

    public required IReadOnlyList<RunningOrderHoldDto> Holds { get; init; }

    public required bool HoldsUnavoidable { get; init; }
}

public sealed record RunningOrderHoldDto
{
    public required RunningOrderHoldKind Kind { get; init; }

    public required string? LineKey { get; init; }

    public required int? BlockKey { get; init; }

    public required int? RuleIndex { get; init; }

    public required int? ActWishId { get; init; }

    public required int ConflictsWithout { get; init; }
}

public sealed record RunningOrderCostStepDto
{
    public required RunningOrderCostStep Step { get; init; }

    public required int Before { get; init; }

    public required int After { get; init; }
}

public sealed record RunningOrderMoveDto
{
    public required string LineKey { get; init; }

    public required int? From { get; init; }

    public required int To { get; init; }

    public required IReadOnlyList<ResolvedFindingDto> Resolved { get; init; }

    public required IReadOnlyList<int> RoomFor { get; init; }
}

public sealed record ResolvedFindingDto
{
    public required FindingKind Kind { get; init; }

    public required IReadOnlyList<string> LineKeys { get; init; }
}
