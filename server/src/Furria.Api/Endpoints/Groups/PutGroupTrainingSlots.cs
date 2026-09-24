using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Groups;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class PutGroupTrainingSlots : Endpoint<PutGroupTrainingSlotsRequest>
{
    private readonly GroupService _groupService;
    private readonly PermissionAuthorizer _authorizer;

    public PutGroupTrainingSlots(GroupService groupService, PermissionAuthorizer authorizer)
    {
        _groupService = groupService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Put("groups/{groupId}/training-slots");
    }

    public override async Task HandleAsync(PutGroupTrainingSlotsRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        if (!await _authorizer.CanAdministerGroupAsync(accountId.Value, req.GroupId, ct))
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        var result = await _groupService.SetTrainingSlotsAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static SetGroupTrainingSlotsCommand ToCommand(PutGroupTrainingSlotsRequest req) =>
        new() { GroupId = req.GroupId, Slots = [.. req.Slots.Select(ToInput)] };

    private static GroupTrainingSlotInput ToInput(TrainingSlotDataDto slot) =>
        new()
        {
            Weekday = slot.Weekday,
            StartsAt = slot.StartsAt,
            DurationMinutes = slot.DurationMinutes,
            VenueId = slot.VenueId,
        };
}

public sealed record PutGroupTrainingSlotsRequest
{
    [RouteParam]
    public required int GroupId { get; init; }

    public required IReadOnlyList<TrainingSlotDataDto> Slots { get; init; }
}

public sealed record TrainingSlotDataDto
{
    public required DayOfWeek Weekday { get; init; }

    public required TimeOnly StartsAt { get; init; }

    public required int DurationMinutes { get; init; }

    public required int? VenueId { get; init; }
}

public sealed class PutGroupTrainingSlotsValidator : Validator<PutGroupTrainingSlotsRequest>
{
    private const string TooManySlotsMessage =
        "So viele Trainingszeiten passen nicht in eine Woche.";

    public PutGroupTrainingSlotsValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0);
        RuleFor(request => request.Slots).NotNull();
        RuleFor(request => request.Slots)
            .Must(slots => slots.Count <= GroupLimits.MaxTrainingSlots)
            .WithMessage(TooManySlotsMessage)
            .When(request => request.Slots is not null);
        RuleForEach(request => request.Slots).SetValidator(new TrainingSlotDataValidator());
    }
}

public sealed class TrainingSlotDataValidator : Validator<TrainingSlotDataDto>
{
    public TrainingSlotDataValidator()
    {
        RuleFor(slot => slot.Weekday).IsInEnum();
        RuleFor(slot => slot.DurationMinutes)
            .InclusiveBetween(
                GroupLimits.MinTrainingDurationMinutes,
                GroupLimits.MaxTrainingDurationMinutes
            );
        RuleFor(slot => slot.VenueId).GreaterThan(0).When(slot => slot.VenueId is not null);
    }
}
