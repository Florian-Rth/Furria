using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Club;
using Furria.Application.Groups;
using Furria.Core.Groups;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class PostTrainingPreview
    : Endpoint<PostTrainingPreviewRequest, PostTrainingPreviewResponse>
{
    private readonly TrainingService _trainingService;
    private readonly PermissionAuthorizer _authorizer;

    public PostTrainingPreview(TrainingService trainingService, PermissionAuthorizer authorizer)
    {
        _trainingService = trainingService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Post("groups/{groupId}/trainings/preview");
    }

    public override async Task HandleAsync(PostTrainingPreviewRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        var personId = User.PersonId();
        if (accountId is null || personId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        if (!await _authorizer.CanAdministerGroupAsync(accountId.Value, req.GroupId, ct))
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        var result = await _trainingService.PreviewAsync(ToQuery(req, personId.Value), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static TrainingPreviewQuery ToQuery(
        PostTrainingPreviewRequest req,
        int viewerPersonId
    ) =>
        new()
        {
            GroupId = req.GroupId,
            ViewerPersonId = viewerPersonId,
            EndsOn = req.EndsOn,
        };

    private static PostTrainingPreviewResponse ToResponse(TrainingPreview preview) =>
        new()
        {
            DefaultEndsOn = preview.DefaultEndsOn,
            EndsOn = preview.EndsOn,
            Rows = [.. preview.Rows.Select(ToDto)],
        };

    private static TrainingPreviewRowDto ToDto(TrainingPreviewRow row) =>
        new()
        {
            GroupTrainingSlotId = row.GroupTrainingSlotId,
            StartsAt = row.StartsAt,
            EndsAt = row.EndsAt,
            VenueId = row.VenueId,
            VenueName = row.VenueName,
            State = row.State,
            VenueCollisions = [.. row.VenueCollisions.Select(ToCollisionDto)],
        };

    private static TrainingCollisionDto ToCollisionDto(CalendarEntrySummary collision) =>
        new()
        {
            CalendarEntryId = collision.CalendarEntryId,
            Title = collision.Title,
            StartsAt = collision.StartsAt,
            EndsAt = collision.EndsAt,
            OwnerGroupName = collision.OwnerGroupName,
        };
}

public sealed record PostTrainingPreviewRequest
{
    [RouteParam]
    public required int GroupId { get; init; }

    public required DateOnly? EndsOn { get; init; }
}

public sealed class PostTrainingPreviewValidator : Validator<PostTrainingPreviewRequest>
{
    public PostTrainingPreviewValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0);
    }
}

public sealed record PostTrainingPreviewResponse
{
    public required DateOnly DefaultEndsOn { get; init; }

    public required DateOnly EndsOn { get; init; }

    public required IReadOnlyList<TrainingPreviewRowDto> Rows { get; init; }
}

public sealed record TrainingPreviewRowDto
{
    public required int GroupTrainingSlotId { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset EndsAt { get; init; }

    public required int? VenueId { get; init; }

    public required string? VenueName { get; init; }

    public required TrainingPreviewState State { get; init; }

    public required IReadOnlyList<TrainingCollisionDto> VenueCollisions { get; init; }
}

public sealed record TrainingCollisionDto
{
    public required int CalendarEntryId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }

    public required string? OwnerGroupName { get; init; }
}
