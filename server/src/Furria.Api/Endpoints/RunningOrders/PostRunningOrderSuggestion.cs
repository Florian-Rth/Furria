using System.Diagnostics.Contracts;
using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.RunningOrders;
using Furria.Core.RunningOrders;
using Furria.Infrastructure.RunningOrders;

namespace Furria.Api.Endpoints.RunningOrders;

public sealed class PostRunningOrderSuggestion
    : Endpoint<PostRunningOrderSuggestionRequest, PostRunningOrderSuggestionResponse>
{
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
        var result = await _runningOrderService.SuggestAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
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
        };

    private static PostRunningOrderSuggestionResponse ToResponse(RunningOrderProposal proposal) =>
        new()
        {
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
}

public sealed class PostRunningOrderSuggestionValidator
    : Validator<PostRunningOrderSuggestionRequest>
{
    private const int MostLines = 200;
    private const int MostRules = 200;

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
    }
}

public sealed record PostRunningOrderSuggestionResponse
{
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
