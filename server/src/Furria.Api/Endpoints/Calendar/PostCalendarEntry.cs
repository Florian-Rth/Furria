using System.Diagnostics.Contracts;
using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Calendar;

public sealed class PostCalendarEntry
    : Endpoint<PostCalendarEntryRequest, PostCalendarEntryResponse>
{
    private readonly CalendarService _calendarService;

    public PostCalendarEntry(CalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    public override void Configure()
    {
        Post("calendar/entries");
    }

    public override async Task HandleAsync(PostCalendarEntryRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        var personId = User.PersonId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _calendarService.CreateAsync(
            ToCommand(req, accountId.Value, personId),
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static CreateCalendarEntryCommand ToCommand(
        PostCalendarEntryRequest req,
        int actorAccountId,
        int? viewerPersonId
    ) =>
        new()
        {
            ActorAccountId = actorAccountId,
            ViewerPersonId = viewerPersonId,
            Title = req.Title,
            Description = req.Description,
            OwnerGroupId = req.OwnerGroupId,
            VenueId = req.VenueId,
            StartsAt = req.StartsAt,
            EndsAt = req.EndsAt,
            Kind = req.Kind,
            Audience = req.Audience,
            AudienceGroupIds = req.AudienceGroupIds,
            AudiencePersonIds = req.AudiencePersonIds,
            AddOns = [.. req.AddOns.Select(ToInput)],
            ParticipatingGroupIds = req.ParticipatingGroupIds,
        };

    private static CalendarEntryAddOnInput ToInput(PostCalendarEntryAddOnDataDto addOn) =>
        new() { Kind = addOn.Kind, Poll = addOn.Poll is { } poll ? ToInput(poll) : null };

    private static CalendarPollInput ToInput(PostCalendarEntryPollDataDto poll) =>
        new()
        {
            PollId = poll.PollId,
            Question = poll.Question,
            AllowsMultipleChoices = poll.AllowsMultipleChoices,
            IsAnonymous = poll.IsAnonymous,
            VotesUntil = poll.VotesUntil,
            Options = [.. poll.Options.Select(ToInput)],
        };

    private static CalendarPollOptionInput ToInput(PostCalendarEntryPollOptionDataDto option) =>
        new() { OptionId = option.OptionId, Label = option.Label };

    private static PostCalendarEntryResponse ToResponse(CalendarEntryWriteResult written) =>
        new()
        {
            CalendarEntryId = written.CalendarEntryId,
            VenueCollisions = [.. written.VenueCollisions.Select(ToDto)],
        };

    private static PostCalendarEntryCollisionDto ToDto(CalendarEntrySummary collision) =>
        new()
        {
            CalendarEntryId = collision.CalendarEntryId,
            Title = collision.Title,
            StartsAt = collision.StartsAt,
            EndsAt = collision.EndsAt,
        };
}

public sealed record PostCalendarEntryRequest
{
    public required string Title { get; init; }

    public required string? Description { get; init; }

    public required int? OwnerGroupId { get; init; }

    public required int? VenueId { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }

    public required CalendarEntryKind Kind { get; init; }

    public required CalendarEntryAudience Audience { get; init; }

    public required IReadOnlyList<int> AudienceGroupIds { get; init; }

    public required IReadOnlyList<int> AudiencePersonIds { get; init; }

    public required IReadOnlyList<PostCalendarEntryAddOnDataDto> AddOns { get; init; }

    public required IReadOnlyList<int> ParticipatingGroupIds { get; init; }
}

public sealed class PostCalendarEntryValidator : Validator<PostCalendarEntryRequest>
{
    private const string UnknownKindMessage = "Diese Art von Eintrag gibt es nicht.";
    private const string EventsLiveInTheWorkbenchMessage =
        "Eine Veranstaltung wird in den Veranstaltungen gepflegt.";
    private const string UnknownAudienceMessage = "Diese Auswahl für „Für wen“ gibt es nicht.";
    private const string NoAudienceGroupMessage = "Wähle mindestens eine Gruppe.";
    private const string NoAudiencePersonMessage = "Wähle mindestens eine Person.";
    private const string AudienceMismatchMessage = "Diese Auswahl passt nicht zu „Für wen“.";
    private const string UnknownPersonMessage = "Diese Person gibt es nicht.";
    private const string UnknownGroupMessage = "Diese Gruppe gibt es nicht.";
    private const string UnknownVenueMessage = "Diesen Ort gibt es nicht im Verzeichnis.";
    private const string TitleMissingMessage = "Der Eintrag braucht einen Titel.";
    private const string AddOnTwiceMessage = "Jeder Baustein kann nur einmal angehängt werden.";
    private const string TooManyAddOnsMessage = "Ein Eintrag trägt höchstens 30 Bausteine.";
    private const string VotesAfterTheStartMessage =
        "Die Abstimmung kann nicht nach dem Beginn enden.";
    private const string ParticipationWithoutAddOnMessage =
        "Ohne den Baustein „Mitwirkende Gruppen“ wirken keine Gruppen mit.";
    private const string EndsBeforeItStartsMessage =
        "Ein Zeitraum kann nicht vor seinem Beginn enden.";

    public PostCalendarEntryValidator()
    {
        RuleFor(request => request.Title)
            .NotEmpty()
            .WithMessage(TitleMissingMessage)
            .MaximumLength(CalendarLimits.TitleLength);
        RuleFor(request => request.Description).MaximumLength(CalendarLimits.DescriptionLength);
        RuleFor(request => request.OwnerGroupId)
            .GreaterThan(0)
            .When(request => request.OwnerGroupId is not null)
            .WithMessage(UnknownGroupMessage);
        RuleFor(request => request.VenueId)
            .GreaterThan(0)
            .When(request => request.VenueId is not null)
            .WithMessage(UnknownVenueMessage);
        RuleFor(request => request.Kind).IsInEnum().WithMessage(UnknownKindMessage);
        RuleFor(request => request.Kind)
            .NotEqual(CalendarEntryKind.Event)
            .WithMessage(EventsLiveInTheWorkbenchMessage);
        RuleFor(request => request.Audience).IsInEnum().WithMessage(UnknownAudienceMessage);
        RuleFor(request => request.AudienceGroupIds).NotNull();
        RuleFor(request => request.AudiencePersonIds).NotNull();
        RuleFor(request => request.AudienceGroupIds)
            .NotEmpty()
            .When(request => request.Audience == CalendarEntryAudience.Groups)
            .WithMessage(NoAudienceGroupMessage);
        RuleFor(request => request.AudienceGroupIds)
            .Empty()
            .When(request => request.Audience != CalendarEntryAudience.Groups)
            .WithMessage(AudienceMismatchMessage);
        RuleFor(request => request.AudiencePersonIds)
            .NotEmpty()
            .When(request => request.Audience == CalendarEntryAudience.People)
            .WithMessage(NoAudiencePersonMessage);
        RuleFor(request => request.AudiencePersonIds)
            .Empty()
            .When(request => request.Audience != CalendarEntryAudience.People)
            .WithMessage(AudienceMismatchMessage);
        RuleForEach(request => request.AudienceGroupIds)
            .GreaterThan(0)
            .WithMessage(UnknownGroupMessage);
        RuleForEach(request => request.AudiencePersonIds)
            .GreaterThan(0)
            .WithMessage(UnknownPersonMessage);
        RuleFor(request => request.EndsAt)
            .GreaterThanOrEqualTo(request => request.StartsAt)
            .When(request => request.EndsAt is not null)
            .WithMessage(EndsBeforeItStartsMessage);
        RuleFor(request => request.AddOns).NotNull();
        RuleFor(request => request.AddOns.Count)
            .LessThanOrEqualTo(CalendarLimits.MaxAddOns)
            .When(request => request.AddOns is not null)
            .WithMessage(TooManyAddOnsMessage);
        RuleForEach(request => request.AddOns)
            .SetValidator(new PostCalendarEntryAddOnDataValidator());
        RuleForEach(request => request.AddOns)
            .Must((request, addOn) => VotesBeforeTheStart(addOn, request.StartsAt))
            .WithMessage(VotesAfterTheStartMessage);
        RuleFor(request => request.AddOns)
            .Must(EachSingleUseAddOnOnce)
            .When(request => request.AddOns is not null)
            .WithMessage(AddOnTwiceMessage);
        RuleFor(request => request.ParticipatingGroupIds).NotNull();
        RuleFor(request => request.ParticipatingGroupIds)
            .Empty()
            .When(request =>
                request.AddOns is not null
                && !request.AddOns.Any(addOn =>
                    addOn?.Kind == CalendarEntryAddOnKind.ParticipatingGroups
                )
            )
            .WithMessage(ParticipationWithoutAddOnMessage);
        RuleForEach(request => request.ParticipatingGroupIds)
            .GreaterThan(0)
            .WithMessage(UnknownGroupMessage);
    }

    [Pure]
    private static bool VotesBeforeTheStart(
        PostCalendarEntryAddOnDataDto addOn,
        DateTimeOffset startsAt
    ) => addOn?.Poll?.VotesUntil is not { } votesUntil || votesUntil <= startsAt;

    [Pure]
    private static bool EachSingleUseAddOnOnce(IReadOnlyList<PostCalendarEntryAddOnDataDto> addOns)
    {
        var singleUse = addOns
            .Where(addOn => addOn is not null && addOn.Kind != CalendarEntryAddOnKind.Poll)
            .Select(addOn => addOn.Kind)
            .ToList();
        var pollIds = addOns.Select(addOn => addOn?.Poll?.PollId).OfType<int>().ToList();

        return singleUse.Distinct().Count() == singleUse.Count
            && pollIds.Distinct().Count() == pollIds.Count;
    }
}

public sealed record PostCalendarEntryAddOnDataDto
{
    public required CalendarEntryAddOnKind Kind { get; init; }

    public required PostCalendarEntryPollDataDto? Poll { get; init; }
}

public sealed record PostCalendarEntryPollDataDto
{
    public required int? PollId { get; init; }

    public required string Question { get; init; }

    public required bool AllowsMultipleChoices { get; init; }

    public required bool IsAnonymous { get; init; }

    public required DateTimeOffset? VotesUntil { get; init; }

    public required IReadOnlyList<PostCalendarEntryPollOptionDataDto> Options { get; init; }
}

public sealed record PostCalendarEntryPollOptionDataDto
{
    public required int? OptionId { get; init; }

    public required string Label { get; init; }
}

public sealed class PostCalendarEntryAddOnDataValidator
    : AbstractValidator<PostCalendarEntryAddOnDataDto>
{
    private const string UnknownAddOnMessage = "Diesen Baustein gibt es nicht.";
    private const string PollWithoutQuestionMessage = "Die Umfrage braucht eine Frage.";
    private const string PollOutsideAPollMessage = "Nur eine Umfrage trägt Fragen und Antworten.";

    public PostCalendarEntryAddOnDataValidator()
    {
        RuleFor(addOn => addOn.Kind).IsInEnum().WithMessage(UnknownAddOnMessage);
        RuleFor(addOn => addOn.Poll)
            .NotNull()
            .When(addOn => addOn.Kind == CalendarEntryAddOnKind.Poll)
            .WithMessage(PollWithoutQuestionMessage);
        RuleFor(addOn => addOn.Poll)
            .Null()
            .When(addOn => addOn.Kind != CalendarEntryAddOnKind.Poll)
            .WithMessage(PollOutsideAPollMessage);
        RuleFor(addOn => addOn.Poll!)
            .SetValidator(new PostCalendarEntryPollDataValidator())
            .When(addOn => addOn.Poll is not null);
    }
}

public sealed class PostCalendarEntryPollDataValidator
    : AbstractValidator<PostCalendarEntryPollDataDto>
{
    private const string UnknownPollMessage = "Diese Umfrage gibt es nicht.";
    private const string UnknownOptionMessage = "Diese Antwort gibt es nicht.";
    private const string QuestionMissingMessage = "Die Umfrage braucht eine Frage.";
    private const string QuestionTooLongMessage = "Eine Frage hat höchstens 200 Zeichen.";
    private const string LabelMissingMessage = "Jede Antwort braucht einen Text.";
    private const string LabelTooLongMessage = "Eine Antwort hat höchstens 120 Zeichen.";
    private const string OptionCountMessage = "Eine Umfrage hat 2 bis 20 Antworten.";
    private const string LabelTwiceMessage = "Jede Antwort kann nur einmal vorkommen.";

    public PostCalendarEntryPollDataValidator()
    {
        RuleFor(poll => poll.PollId)
            .GreaterThan(0)
            .When(poll => poll.PollId is not null)
            .WithMessage(UnknownPollMessage);
        RuleFor(poll => poll.Question)
            .Cascade(CascadeMode.Stop)
            .Must(question => !string.IsNullOrWhiteSpace(question))
            .WithMessage(QuestionMissingMessage)
            .MaximumLength(CalendarLimits.PollQuestionLength)
            .WithMessage(QuestionTooLongMessage);
        RuleFor(poll => poll.Options).NotNull();
        RuleFor(poll => poll.Options.Count)
            .InclusiveBetween(CalendarLimits.PollMinOptions, CalendarLimits.PollMaxOptions)
            .When(poll => poll.Options is not null)
            .WithMessage(OptionCountMessage);
        RuleForEach(poll => poll.Options)
            .Cascade(CascadeMode.Stop)
            .Must(option => option is not null && !string.IsNullOrWhiteSpace(option.Label))
            .WithMessage(LabelMissingMessage)
            .Must(option => option.Label.Length <= CalendarLimits.PollOptionLabelLength)
            .WithMessage(LabelTooLongMessage)
            .Must(option => option.OptionId is not { } optionId || optionId > 0)
            .WithMessage(UnknownOptionMessage);
        RuleFor(poll => poll.Options)
            .Must(EachLabelOnce)
            .When(poll => poll.Options is not null && poll.Options.All(HasLabel))
            .WithMessage(LabelTwiceMessage);
        RuleFor(poll => poll.Options)
            .Must(EachOptionOnce)
            .When(poll => poll.Options is not null && poll.Options.All(HasLabel))
            .WithMessage(UnknownOptionMessage);
        RuleFor(poll => poll.Options)
            .Must(options => options.All(option => option.OptionId is null))
            .When(poll =>
                poll.PollId is null && poll.Options is not null && poll.Options.All(HasLabel)
            )
            .WithMessage(UnknownOptionMessage);
    }

    [Pure]
    private static bool HasLabel(PostCalendarEntryPollOptionDataDto? option) =>
        option?.Label is not null;

    [Pure]
    private static bool EachLabelOnce(IReadOnlyList<PostCalendarEntryPollOptionDataDto> options) =>
        options
            .Select(option => option.Label.Trim().ToLowerInvariant())
            .Distinct(StringComparer.Ordinal)
            .Count() == options.Count;

    [Pure]
    private static bool EachOptionOnce(IReadOnlyList<PostCalendarEntryPollOptionDataDto> options)
    {
        var held = options.Select(option => option.OptionId).OfType<int>().ToList();
        return held.Distinct().Count() == held.Count;
    }
}

public sealed record PostCalendarEntryResponse
{
    public required int CalendarEntryId { get; init; }

    public required IReadOnlyList<PostCalendarEntryCollisionDto> VenueCollisions { get; init; }
}

public sealed record PostCalendarEntryCollisionDto
{
    public required int CalendarEntryId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }
}
