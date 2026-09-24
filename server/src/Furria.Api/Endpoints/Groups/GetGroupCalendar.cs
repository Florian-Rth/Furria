using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Endpoints.Calendar;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Groups;

public sealed class GetGroupCalendar : Endpoint<GetGroupCalendarRequest, GetGroupCalendarResponse>
{
    private readonly CalendarService _calendarService;
    private readonly PermissionAuthorizer _authorizer;
    private readonly TimeProvider _timeProvider;

    public GetGroupCalendar(
        CalendarService calendarService,
        PermissionAuthorizer authorizer,
        TimeProvider timeProvider
    )
    {
        _calendarService = calendarService;
        _authorizer = authorizer;
        _timeProvider = timeProvider;
    }

    public override void Configure()
    {
        Get("groups/{groupId}/calendar");
    }

    public override async Task HandleAsync(GetGroupCalendarRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        var personId = User.PersonId();
        if (accountId is null || personId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        if (!await MayReadAsync(accountId.Value, req.GroupId, ct))
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        var from = req.From ?? ClubClock.Today(_timeProvider);
        var to = req.To ?? from.AddDays(CalendarLimits.DefaultWindowDays);

        var entries = await _calendarService.GetGroupEntriesAsync(
            personId.Value,
            req.GroupId,
            from,
            to,
            ct
        );

        await Send.OkAsync(ToResponse(entries), cancellation: ct);
    }

    private async Task<bool> MayReadAsync(int accountId, int groupId, CancellationToken ct) =>
        await _authorizer.IsGroupMemberOrAdminAsync(accountId, groupId, ct)
        || await _authorizer.IsGrantedAsync(accountId, FurriaPermissions.GroupsManage, ct);

    private static GetGroupCalendarResponse ToResponse(
        IReadOnlyList<CalendarEntrySummary> entries
    ) => new() { Entries = [.. entries.Select(ToDto)] };

    private static GroupCalendarEntryDto ToDto(CalendarEntrySummary entry) =>
        new()
        {
            CalendarEntryId = entry.CalendarEntryId,
            Title = entry.Title,
            StartsAt = entry.StartsAt,
            EndsAt = entry.EndsAt,
            Kind = entry.Kind,
            VenueId = entry.VenueId,
            VenueName = entry.VenueName,
            OwnerGroupId = entry.OwnerGroupId,
            OwnerGroupName = entry.OwnerGroupName,
            OwnerGroupTone = entry.OwnerGroupTone,
            ParticipatingGroups = [.. entry.ParticipatingGroups.Select(ToDto)],
            Visibility = entry.Visibility,
            AsksForResponse = entry.AsksForResponse,
            Description = entry.Description,
            ViewerAnswer = entry.ViewerAnswer,
            IsRunning = entry.IsRunning,
        };

    private static GroupCalendarParticipantDto ToDto(ParticipatingGroup group) =>
        new()
        {
            GroupId = group.GroupId,
            Name = group.Name,
            Tone = group.Tone,
        };
}

public sealed record GetGroupCalendarRequest
{
    [RouteParam]
    public required int GroupId { get; init; }

    [QueryParam]
    [BindFrom("from")]
    public DateOnly? From { get; init; }

    [QueryParam]
    [BindFrom("to")]
    public DateOnly? To { get; init; }
}

public sealed class GetGroupCalendarValidator : Validator<GetGroupCalendarRequest>
{
    private const string UnknownGroupMessage = "Diese Gruppe gibt es nicht.";
    private const string WindowEndsBeforeItStartsMessage =
        "Ein Zeitraum kann nicht vor seinem Beginn enden.";
    private static readonly string WindowTooLongMessage =
        $"Ein Zeitraum umfasst höchstens {CalendarLimits.MaxWindowDays} Tage.";

    public GetGroupCalendarValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0).WithMessage(UnknownGroupMessage);

        RuleFor(request => request)
            .Must(SpansForwards)
            .When(HasBothEnds)
            .WithMessage(WindowEndsBeforeItStartsMessage);

        RuleFor(request => request)
            .Must(StaysInsideTheLimit)
            .When(request => HasBothEnds(request) && SpansForwards(request))
            .WithMessage(WindowTooLongMessage);
    }

    private static bool HasBothEnds(GetGroupCalendarRequest request) =>
        request.From is not null && request.To is not null;

    private static bool SpansForwards(GetGroupCalendarRequest request) =>
        request.To!.Value >= request.From!.Value;

    private static bool StaysInsideTheLimit(GetGroupCalendarRequest request) =>
        request.To!.Value.DayNumber - request.From!.Value.DayNumber <= CalendarLimits.MaxWindowDays;
}

public sealed record GetGroupCalendarResponse
{
    public required IReadOnlyList<GroupCalendarEntryDto> Entries { get; init; }
}

public sealed record GroupCalendarEntryDto
{
    public required int CalendarEntryId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }

    public required CalendarEntryKind Kind { get; init; }

    public required int? VenueId { get; init; }

    public required string? VenueName { get; init; }

    public required int? OwnerGroupId { get; init; }

    public required string? OwnerGroupName { get; init; }

    public required GroupTone? OwnerGroupTone { get; init; }

    public required IReadOnlyList<GroupCalendarParticipantDto> ParticipatingGroups { get; init; }

    public required CalendarEntryVisibility Visibility { get; init; }

    public required bool AsksForResponse { get; init; }

    public required string? Description { get; init; }

    public required AttendanceAnswer? ViewerAnswer { get; init; }

    public required bool IsRunning { get; init; }
}

public sealed record GroupCalendarParticipantDto
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required GroupTone? Tone { get; init; }
}
