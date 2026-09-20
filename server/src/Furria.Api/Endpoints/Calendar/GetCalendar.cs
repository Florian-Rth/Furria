using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Calendar;

public sealed class GetCalendar : Endpoint<GetCalendarRequest, GetCalendarResponse>
{
    private readonly CalendarService _calendarService;
    private readonly TimeProvider _timeProvider;

    public GetCalendar(CalendarService calendarService, TimeProvider timeProvider)
    {
        _calendarService = calendarService;
        _timeProvider = timeProvider;
    }

    public override void Configure()
    {
        Get("calendar");
        Definition.RequirePermission(FurriaPermissions.ClubRead);
    }

    public override async Task HandleAsync(GetCalendarRequest req, CancellationToken ct)
    {
        var personId = User.PersonId();
        if (personId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var from = req.From ?? ClubClock.Today(_timeProvider);
        var to = req.To ?? from.AddDays(CalendarLimits.DefaultWindowDays);

        var entries = await _calendarService.GetEntriesAsync(
            personId.Value,
            req.Scope == CalendarScope.Club,
            req.GroupId,
            from,
            to,
            ct
        );

        await Send.OkAsync(ToResponse(entries), cancellation: ct);
    }

    private static GetCalendarResponse ToResponse(IReadOnlyList<CalendarEntrySummary> entries) =>
        new() { Entries = [.. entries.Select(ToDto)] };

    private static CalendarEntryDto ToDto(CalendarEntrySummary entry) =>
        new()
        {
            CalendarEntryId = entry.CalendarEntryId,
            Title = entry.Title,
            StartsAt = entry.StartsAt,
            EndsAt = entry.EndsAt,
            Kind = entry.Kind,
            VenueName = entry.VenueName,
            OwnerGroupId = entry.OwnerGroupId,
            OwnerGroupName = entry.OwnerGroupName,
            Visibility = entry.Visibility,
            AsksForResponse = entry.AsksForResponse,
            Description = entry.Description,
            ViewerAnswer = entry.ViewerAnswer,
            IsRunning = entry.IsRunning,
        };
}

public sealed record GetCalendarRequest
{
    [QueryParam]
    public CalendarScope? Scope { get; init; }

    [QueryParam]
    public int? GroupId { get; init; }

    [QueryParam]
    [BindFrom("from")]
    public DateOnly? From { get; init; }

    [QueryParam]
    [BindFrom("to")]
    public DateOnly? To { get; init; }
}

public sealed class GetCalendarValidator : Validator<GetCalendarRequest>
{
    private const string UnknownGruppeMessage = "Diese Gruppe gibt es nicht.";
    private const string GruppenScopeNeedsGruppeMessage =
        "Für den Bereich „Gruppe“ wird eine Gruppe gebraucht.";
    private const string WindowEndsBeforeItStartsMessage =
        "Ein Zeitraum kann nicht vor seinem Beginn enden.";
    private static readonly string WindowTooLongMessage =
        $"Ein Zeitraum umfasst höchstens {CalendarLimits.MaxWindowDays} Tage.";

    public GetCalendarValidator()
    {
        RuleFor(request => request.GroupId)
            .GreaterThan(0)
            .When(request => request.GroupId is not null)
            .WithMessage(UnknownGruppeMessage);

        RuleFor(request => request.GroupId)
            .NotNull()
            .When(request => request.Scope == CalendarScope.Group)
            .WithMessage(GruppenScopeNeedsGruppeMessage);

        RuleFor(request => request)
            .Must(SpansForwards)
            .When(HasBothEnds)
            .WithMessage(WindowEndsBeforeItStartsMessage);

        RuleFor(request => request)
            .Must(StaysInsideTheLimit)
            .When(request => HasBothEnds(request) && SpansForwards(request))
            .WithMessage(WindowTooLongMessage);
    }

    private static bool HasBothEnds(GetCalendarRequest request) =>
        request.From is not null && request.To is not null;

    private static bool SpansForwards(GetCalendarRequest request) =>
        request.To!.Value >= request.From!.Value;

    private static bool StaysInsideTheLimit(GetCalendarRequest request) =>
        request.To!.Value.DayNumber - request.From!.Value.DayNumber <= CalendarLimits.MaxWindowDays;
}

public sealed record GetCalendarResponse
{
    public required IReadOnlyList<CalendarEntryDto> Entries { get; init; }
}

public sealed record CalendarEntryDto
{
    public required int CalendarEntryId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }

    public required CalendarEntryKind Kind { get; init; }

    public required string? VenueName { get; init; }

    public required int? OwnerGroupId { get; init; }

    public required string? OwnerGroupName { get; init; }

    public required CalendarEntryVisibility Visibility { get; init; }

    public required bool AsksForResponse { get; init; }

    public required string? Description { get; init; }

    public required AttendanceAnswer? ViewerAnswer { get; init; }

    public required bool IsRunning { get; init; }
}
