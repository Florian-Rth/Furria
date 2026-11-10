using System.Diagnostics.Contracts;
using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Media;
using Furria.Api.Results;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Core.Events;
using Furria.Core.Groups;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Calendar;

public sealed class GetCalendar : Endpoint<GetCalendarRequest, GetCalendarResponse>
{
    private readonly CalendarService _calendarService;
    private readonly UsualTrainingService _usualTrainingService;
    private readonly TimeProvider _timeProvider;

    public GetCalendar(
        CalendarService calendarService,
        UsualTrainingService usualTrainingService,
        TimeProvider timeProvider
    )
    {
        _calendarService = calendarService;
        _usualTrainingService = usualTrainingService;
        _timeProvider = timeProvider;
    }

    public override void Configure()
    {
        Get("calendar");
    }

    public override async Task HandleAsync(GetCalendarRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var from = req.From ?? ClubClock.Today(_timeProvider);
        var to = req.To ?? from.AddDays(CalendarLimits.DefaultWindowDays);

        var window = new CalendarWindowQuery
        {
            ViewerAccountId = accountId.Value,
            ClubOwnedOnly = req.Scope == CalendarScope.Club,
            OwnerGroupId = req.GroupId,
            From = from,
            To = to,
        };

        var entries = await _calendarService.GetEntriesAsync(window, ct);
        if (!entries.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(entries.Error, ct);
            return;
        }

        var usualTrainings = await _usualTrainingService.GetUsualTrainingsAsync(window, ct);
        if (!usualTrainings.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(usualTrainings.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(entries.Value, usualTrainings.Value), cancellation: ct);
    }

    private static GetCalendarResponse ToResponse(
        IReadOnlyList<CalendarEntrySummary> entries,
        IReadOnlyList<UsualTrainingSummary> usualTrainings
    ) =>
        new()
        {
            Entries = [.. entries.Select(CalendarEntryDto.From)],
            UsualTrainings = [.. usualTrainings.Select(UsualTrainingDto.From)],
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
    private const string UnknownGroupMessage = "Diese Gruppe gibt es nicht.";
    private const string GroupScopeNeedsGroupMessage =
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
            .WithMessage(UnknownGroupMessage);

        RuleFor(request => request.GroupId)
            .NotNull()
            .When(request => request.Scope == CalendarScope.Group)
            .WithMessage(GroupScopeNeedsGroupMessage);

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

    public required IReadOnlyList<UsualTrainingDto> UsualTrainings { get; init; }
}

public sealed record UsualTrainingDto
{
    public required int UsualTrainingTimeId { get; init; }

    public required int GroupId { get; init; }

    public required string GroupName { get; init; }

    public required GroupTone? GroupTone { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset EndsAt { get; init; }

    public required int? VenueId { get; init; }

    public required string? VenueName { get; init; }

    [Pure]
    public static UsualTrainingDto From(UsualTrainingSummary usual) =>
        new()
        {
            UsualTrainingTimeId = usual.UsualTrainingTimeId,
            GroupId = usual.GroupId,
            GroupName = usual.GroupName,
            GroupTone = usual.GroupTone,
            StartsAt = usual.StartsAt,
            EndsAt = usual.EndsAt,
            VenueId = usual.VenueId,
            VenueName = usual.VenueName,
        };
}

public sealed record CalendarEntryDto
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

    public required IReadOnlyList<ParticipatingGroupDto> ParticipatingGroups { get; init; }

    public required CalendarEntryAudience Audience { get; init; }

    public required IReadOnlyList<AudienceGroupDto> AudienceGroups { get; init; }

    public required IReadOnlyList<AudiencePersonDto> AudiencePeople { get; init; }

    public required bool AsksForResponse { get; init; }

    public required IReadOnlyList<CalendarEntryAddOnDto> AddOns { get; init; }

    public required int ResponseCount { get; init; }

    public required string? Description { get; init; }

    public required AttendanceAnswer? ViewerAnswer { get; init; }

    public required bool IsRunning { get; init; }

    public required CalendarEventFactsDto? Event { get; init; }

    [Pure]
    public static CalendarEntryDto From(CalendarEntrySummary entry) =>
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
            ParticipatingGroups = [.. entry.ParticipatingGroups.Select(ParticipatingGroupDto.From)],
            Audience = entry.Audience,
            AudienceGroups = [.. entry.AudienceGroups.Select(AudienceGroupDto.From)],
            AudiencePeople = [.. entry.AudiencePeople.Select(AudiencePersonDto.From)],
            AsksForResponse = entry.AsksForResponse,
            AddOns = [.. entry.AddOns.Select(CalendarEntryAddOnDto.From)],
            ResponseCount = entry.ResponseCount,
            Description = entry.Description,
            ViewerAnswer = entry.ViewerAnswer,
            IsRunning = entry.IsRunning,
            Event = entry.Event is { } facts ? CalendarEventFactsDto.From(facts) : null,
        };
}

public sealed record CalendarEntryAddOnDto
{
    public required CalendarEntryAddOnKind Kind { get; init; }

    public required CalendarPollDto? Poll { get; init; }

    [Pure]
    public static CalendarEntryAddOnDto From(CalendarEntryAddOnDetails addOn) =>
        new()
        {
            Kind = addOn.Kind,
            Poll = addOn.Poll is { } poll ? CalendarPollDto.From(poll) : null,
        };
}

public sealed record CalendarPollDto
{
    public required int PollId { get; init; }

    public required string Question { get; init; }

    public required bool AllowsMultipleChoices { get; init; }

    public required bool IsAnonymous { get; init; }

    public required DateTimeOffset? VotesUntil { get; init; }

    public required DateTimeOffset? ClosedAt { get; init; }

    public required bool IsClosed { get; init; }

    public required int VoterCount { get; init; }

    public required IReadOnlyList<CalendarPollOptionDto> Options { get; init; }

    [Pure]
    public static CalendarPollDto From(CalendarPollDetails poll) =>
        new()
        {
            PollId = poll.PollId,
            Question = poll.Question,
            AllowsMultipleChoices = poll.AllowsMultipleChoices,
            IsAnonymous = poll.IsAnonymous,
            VotesUntil = poll.VotesUntil,
            ClosedAt = poll.ClosedAt,
            IsClosed = poll.IsClosed,
            VoterCount = poll.VoterCount,
            Options = [.. poll.Options.Select(CalendarPollOptionDto.From)],
        };
}

public sealed record CalendarPollOptionDto
{
    public required int OptionId { get; init; }

    public required string Label { get; init; }

    public required int VoteCount { get; init; }

    public required bool ViewerChose { get; init; }

    public required IReadOnlyList<CalendarPollVoterDto> Voters { get; init; }

    [Pure]
    public static CalendarPollOptionDto From(CalendarPollOptionDetails option) =>
        new()
        {
            OptionId = option.OptionId,
            Label = option.Label,
            VoteCount = option.VoteCount,
            ViewerChose = option.ViewerChose,
            Voters = [.. option.Voters.Select(CalendarPollVoterDto.From)],
        };
}

public sealed record CalendarPollVoterDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    [Pure]
    public static CalendarPollVoterDto From(CalendarPollVoter voter) =>
        new()
        {
            PersonId = voter.PersonId,
            FirstName = voter.FirstName,
            LastName = voter.LastName,
        };
}

public sealed record CalendarEventFactsDto
{
    public required TimeOnly? DoorsOpenAt { get; init; }

    public required string Teaser { get; init; }

    public required string? AgeHint { get; init; }

    public required int? PriceCents { get; init; }

    public required DateTimeOffset? PresaleStartsAt { get; init; }

    public required EventSalesStatus Status { get; init; }

    public required PictureDto? Picture { get; init; }

    [Pure]
    public static CalendarEventFactsDto From(CalendarEventFacts facts) =>
        new()
        {
            DoorsOpenAt = facts.DoorsOpenAt,
            Teaser = facts.Teaser,
            AgeHint = facts.AgeHint,
            PriceCents = facts.PriceCents,
            PresaleStartsAt = facts.PresaleStartsAt,
            Status = facts.Status,
            Picture = PictureDto.From(facts.Picture),
        };
}

public sealed record AudienceGroupDto
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required GroupTone? Tone { get; init; }

    [Pure]
    public static AudienceGroupDto From(AudienceGroup group) =>
        new()
        {
            GroupId = group.GroupId,
            Name = group.Name,
            Tone = group.Tone,
        };
}

public sealed record AudiencePersonDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    [Pure]
    public static AudiencePersonDto From(AudiencePerson person) =>
        new()
        {
            PersonId = person.PersonId,
            FirstName = person.FirstName,
            LastName = person.LastName,
        };
}

public sealed record ParticipatingGroupDto
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required GroupTone? Tone { get; init; }

    [Pure]
    public static ParticipatingGroupDto From(ParticipatingGroup group) =>
        new()
        {
            GroupId = group.GroupId,
            Name = group.Name,
            Tone = group.Tone,
        };
}
