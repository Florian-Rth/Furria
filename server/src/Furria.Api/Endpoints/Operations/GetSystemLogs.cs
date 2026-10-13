using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.Operations;
using Furria.Infrastructure.Operations;

namespace Furria.Api.Endpoints.Operations;

public sealed class GetSystemLogs : Endpoint<GetSystemLogsRequest, GetSystemLogsResponse>
{
    private readonly SystemLogService _systemLogService;

    public GetSystemLogs(SystemLogService systemLogService)
    {
        _systemLogService = systemLogService;
    }

    public override void Configure()
    {
        Get("system/logs");
        Definition.RequirePermission(FurriaPermissions.SystemView);
    }

    public override async Task HandleAsync(GetSystemLogsRequest req, CancellationToken ct)
    {
        var page = await _systemLogService.PageAsync(ToQuery(req), ct);

        await Send.OkAsync(ToResponse(page), cancellation: ct);
    }

    private static LogEntryQuery ToQuery(GetSystemLogsRequest request) =>
        new()
        {
            Source = request.Source,
            MinimumLevel = request.MinimumLevel,
            Search = request.Search,
            Before = request.Before,
            Take = request.Take ?? LogEntryQuery.DefaultTake,
        };

    private static GetSystemLogsResponse ToResponse(LogPageDetails page) =>
        new() { Entries = [.. page.Entries.Select(ToDto)], NextBefore = page.NextBefore };

    private static SystemLogEntryDto ToDto(LogEntrySummary entry) =>
        new()
        {
            Id = entry.Id,
            LoggedAt = entry.LoggedAt,
            Source = entry.Source,
            Instance = entry.Instance,
            Level = entry.Level,
            Category = entry.Category,
            Template = entry.Template,
            Message = entry.Message,
            Exception = entry.Exception,
        };
}

public sealed record GetSystemLogsRequest
{
    [QueryParam]
    public LogSource? Source { get; init; }

    [QueryParam]
    public LogEntryLevel? MinimumLevel { get; init; }

    [QueryParam]
    public string? Search { get; init; }

    [QueryParam]
    public long? Before { get; init; }

    [QueryParam]
    public int? Take { get; init; }
}

public sealed class GetSystemLogsValidator : Validator<GetSystemLogsRequest>
{
    private const int MaximumSearchLength = 200;
    private const string UnknownSourceMessage = "Diese Quelle gibt es nicht.";
    private const string UnknownLevelMessage = "Diese Stufe gibt es nicht.";
    private const string SearchTooLongMessage = "Eine Suche umfasst höchstens 200 Zeichen.";
    private const string BeforeOutOfRangeMessage = "Dieser Eintrag existiert nicht.";
    private static readonly string TakeOutOfRangeMessage =
        $"Es lassen sich 1 bis {LogEntryQuery.MaximumTake} Einträge auf einmal laden.";

    public GetSystemLogsValidator()
    {
        RuleFor(request => request.Source).IsInEnum().WithMessage(UnknownSourceMessage);
        RuleFor(request => request.MinimumLevel).IsInEnum().WithMessage(UnknownLevelMessage);
        RuleFor(request => request.Search)
            .MaximumLength(MaximumSearchLength)
            .WithMessage(SearchTooLongMessage);
        RuleFor(request => request.Before).GreaterThan(0).WithMessage(BeforeOutOfRangeMessage);
        RuleFor(request => request.Take)
            .InclusiveBetween(1, LogEntryQuery.MaximumTake)
            .WithMessage(TakeOutOfRangeMessage);
    }
}

public sealed record GetSystemLogsResponse
{
    public required IReadOnlyList<SystemLogEntryDto> Entries { get; init; }

    public required long? NextBefore { get; init; }
}

public sealed record SystemLogEntryDto
{
    public required long Id { get; init; }

    public required DateTimeOffset LoggedAt { get; init; }

    public required LogSource Source { get; init; }

    public required string Instance { get; init; }

    public required LogEntryLevel Level { get; init; }

    public required string Category { get; init; }

    public required string Template { get; init; }

    public required string Message { get; init; }

    public required string? Exception { get; init; }
}
