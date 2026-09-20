using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Calendar;

public sealed class PutCalendarEntry : Endpoint<PutCalendarEntryRequest, PutCalendarEntryResponse>
{
    private readonly CalendarService _calendarService;
    private readonly PermissionAuthorizer _authorizer;

    public PutCalendarEntry(CalendarService calendarService, PermissionAuthorizer authorizer)
    {
        _calendarService = calendarService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Put("calendar/entries/{calendarEntryId}");
    }

    public override async Task HandleAsync(PutCalendarEntryRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        var personId = User.PersonId();
        if (accountId is null || personId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var ownership = await _calendarService.OwnershipOfAsync(req.CalendarEntryId, ct);
        if (ownership is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        if (!await MayMoveAsync(accountId.Value, ownership.OwnerGroupId, req.OwnerGroupId, ct))
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        var result = await _calendarService.UpdateAsync(ToCommand(req, personId.Value), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private async Task<bool> MayMoveAsync(
        int accountId,
        int? heldOwnerGroupId,
        int? wantedOwnerGroupId,
        CancellationToken ct
    ) =>
        await _authorizer.MayOwnCalendarEntryAsync(accountId, heldOwnerGroupId, ct)
        && await _authorizer.MayOwnCalendarEntryAsync(accountId, wantedOwnerGroupId, ct);

    private static UpdateCalendarEntryCommand ToCommand(
        PutCalendarEntryRequest req,
        int viewerPersonId
    ) =>
        new()
        {
            ViewerPersonId = viewerPersonId,
            CalendarEntryId = req.CalendarEntryId,
            Title = req.Title,
            Description = req.Description,
            OwnerGroupId = req.OwnerGroupId,
            VenueId = req.VenueId,
            StartsAt = req.StartsAt,
            EndsAt = req.EndsAt,
            Kind = req.Kind,
            Visibility = req.Visibility,
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

    public required CalendarEntryVisibility Visibility { get; init; }

    public required bool AsksForResponse { get; init; }

    public required IReadOnlyList<int> ParticipatingGroupIds { get; init; }
}

public sealed class PutCalendarEntryValidator : Validator<PutCalendarEntryRequest>
{
    private const string UnknownKindMessage = "Diese Art von Eintrag gibt es nicht.";
    private const string UnknownVisibilityMessage = "Diese Sichtbarkeit gibt es nicht.";
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
        RuleFor(request => request.Visibility).IsInEnum().WithMessage(UnknownVisibilityMessage);
        RuleFor(request => request.EndsAt)
            .GreaterThanOrEqualTo(request => request.StartsAt)
            .When(request => request.EndsAt is not null)
            .WithMessage(EndsBeforeItStartsMessage);
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
