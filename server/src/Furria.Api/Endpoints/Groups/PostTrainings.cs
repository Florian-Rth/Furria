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

public sealed class PostTrainings : Endpoint<PostTrainingsRequest, PostTrainingsResponse>
{
    private readonly TrainingService _trainingService;
    private readonly PermissionAuthorizer _authorizer;

    public PostTrainings(TrainingService trainingService, PermissionAuthorizer authorizer)
    {
        _trainingService = trainingService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Post("groups/{groupId}/trainings");
    }

    public override async Task HandleAsync(PostTrainingsRequest req, CancellationToken ct)
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

        var result = await _trainingService.GenerateAsync(ToCommand(req, personId.Value), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static GenerateTrainingsCommand ToCommand(
        PostTrainingsRequest req,
        int viewerPersonId
    ) =>
        new()
        {
            GroupId = req.GroupId,
            ViewerPersonId = viewerPersonId,
            Title = req.Title,
            Instants = [.. req.Instants.Select(ToInstant)],
        };

    private static TrainingInstant ToInstant(TrainingInstantDataDto instant) =>
        new() { GroupTrainingSlotId = instant.GroupTrainingSlotId, StartsAt = instant.StartsAt };

    private static PostTrainingsResponse ToResponse(TrainingGenerationResult written) =>
        new()
        {
            CreatedCount = written.CreatedCount,
            SkippedCount = written.SkippedCount,
            VenueCollisions = [.. written.VenueCollisions.Select(ToDto)],
        };

    private static GeneratedTrainingCollisionDto ToDto(CalendarEntrySummary collision) =>
        new()
        {
            CalendarEntryId = collision.CalendarEntryId,
            Title = collision.Title,
            StartsAt = collision.StartsAt,
            EndsAt = collision.EndsAt,
            OwnerGroupName = collision.OwnerGroupName,
        };
}

public sealed record PostTrainingsRequest
{
    [RouteParam]
    public required int GroupId { get; init; }

    public required string Title { get; init; }

    public required IReadOnlyList<TrainingInstantDataDto> Instants { get; init; }
}

public sealed record TrainingInstantDataDto
{
    public required int GroupTrainingSlotId { get; init; }

    public required DateTimeOffset StartsAt { get; init; }
}

public sealed class PostTrainingsValidator : Validator<PostTrainingsRequest>
{
    private const string TitleMissingMessage = "Die Trainings brauchen einen Titel.";
    private const string NothingTickedMessage = "Es ist kein Termin angehakt.";
    private const string TooManyMessage = "So viele Trainings entstehen nicht auf einmal.";

    public PostTrainingsValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0);
        RuleFor(request => request.Title)
            .NotEmpty()
            .WithMessage(TitleMissingMessage)
            .MaximumLength(GroupLimits.MaxTrainingTitleLength);
        RuleFor(request => request.Instants).NotEmpty().WithMessage(NothingTickedMessage);
        RuleFor(request => request.Instants)
            .Must(instants => instants.Count <= TrainingGenerator.MaxHorizonDays)
            .WithMessage(TooManyMessage)
            .When(request => request.Instants is not null);
        RuleForEach(request => request.Instants).SetValidator(new TrainingInstantDataValidator());
    }
}

public sealed class TrainingInstantDataValidator : Validator<TrainingInstantDataDto>
{
    public TrainingInstantDataValidator()
    {
        RuleFor(instant => instant.GroupTrainingSlotId).GreaterThan(0);
    }
}

public sealed record PostTrainingsResponse
{
    public required int CreatedCount { get; init; }

    public required int SkippedCount { get; init; }

    public required IReadOnlyList<GeneratedTrainingCollisionDto> VenueCollisions { get; init; }
}

public sealed record GeneratedTrainingCollisionDto
{
    public required int CalendarEntryId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }

    public required string? OwnerGroupName { get; init; }
}
