using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Calendar;

public sealed class PostCalendarEntry
    : Endpoint<PostCalendarEntryRequest, PostCalendarEntryResponse>
{
    private readonly CalendarService _calendarService;
    private readonly PermissionAuthorizer _authorizer;

    public PostCalendarEntry(CalendarService calendarService, PermissionAuthorizer authorizer)
    {
        _calendarService = calendarService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Post("calendar/entries");
    }

    public override async Task HandleAsync(PostCalendarEntryRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        var personId = User.PersonId();
        if (accountId is null || personId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        if (!await _authorizer.MayOwnCalendarEntryAsync(accountId.Value, req.OwnerGroupId, ct))
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        var result = await _calendarService.CreateAsync(ToCommand(req, personId.Value), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static CreateCalendarEntryCommand ToCommand(
        PostCalendarEntryRequest req,
        int viewerPersonId
    ) =>
        new()
        {
            ViewerPersonId = viewerPersonId,
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

    public required CalendarEntryVisibility Visibility { get; init; }

    public required bool AsksForResponse { get; init; }

    public required IReadOnlyList<int> ParticipatingGroupIds { get; init; }
}

public sealed class PostCalendarEntryValidator : Validator<PostCalendarEntryRequest>
{
    private const string UnknownKindMessage = "Diese Art von Eintrag gibt es nicht.";
    private const string UnknownVisibilityMessage = "Diese Sichtbarkeit gibt es nicht.";
    private const string UnknownGroupMessage = "Diese Gruppe gibt es nicht.";
    private const string UnknownVenueMessage = "Diesen Ort gibt es nicht im Verzeichnis.";
    private const string TitleMissingMessage = "Der Eintrag braucht einen Titel.";
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
