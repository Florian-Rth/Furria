using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Calendar;

public sealed class PutCalendarEntry : Endpoint<PutCalendarEntryRequest, PutCalendarEntryResponse>
{
    private readonly CalendarService _calendarService;

    public PutCalendarEntry(CalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    public override void Configure()
    {
        Put("calendar/entries/{calendarEntryId}");
    }

    public override async Task HandleAsync(PutCalendarEntryRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        var personId = User.PersonId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _calendarService.UpdateAsync(
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

    private static UpdateCalendarEntryCommand ToCommand(
        PutCalendarEntryRequest req,
        int actorAccountId,
        int? viewerPersonId
    ) =>
        new()
        {
            ActorAccountId = actorAccountId,
            ViewerPersonId = viewerPersonId,
            CalendarEntryId = req.CalendarEntryId,
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
            AsksForResponse = req.AsksForResponse,
            ParticipatingGroupIds = req.ParticipatingGroupIds,
        };

    private static PutCalendarEntryResponse ToResponse(CalendarEntryWriteResult written) =>
        new()
        {
            CalendarEntryId = written.CalendarEntryId,
            VenueCollisions = [.. written.VenueCollisions.Select(ToDto)],
        };

    private static PutCalendarEntryCollisionDto ToDto(CalendarEntrySummary collision) =>
        new()
        {
            CalendarEntryId = collision.CalendarEntryId,
            Title = collision.Title,
            StartsAt = collision.StartsAt,
            EndsAt = collision.EndsAt,
        };
}

public sealed record PutCalendarEntryRequest
{
    [RouteParam]
    public required int CalendarEntryId { get; init; }

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

    public required bool AsksForResponse { get; init; }

    public required IReadOnlyList<int> ParticipatingGroupIds { get; init; }
}

public sealed class PutCalendarEntryValidator : Validator<PutCalendarEntryRequest>
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
    private const string EndsBeforeItStartsMessage =
        "Ein Zeitraum kann nicht vor seinem Beginn enden.";

    public PutCalendarEntryValidator()
    {
        RuleFor(request => request.CalendarEntryId).GreaterThan(0);
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
        RuleFor(request => request.ParticipatingGroupIds).NotNull();
        RuleForEach(request => request.ParticipatingGroupIds)
            .GreaterThan(0)
            .WithMessage(UnknownGroupMessage);
    }
}

public sealed record PutCalendarEntryResponse
{
    public required int CalendarEntryId { get; init; }

    public required IReadOnlyList<PutCalendarEntryCollisionDto> VenueCollisions { get; init; }
}

public sealed record PutCalendarEntryCollisionDto
{
    public required int CalendarEntryId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }
}
