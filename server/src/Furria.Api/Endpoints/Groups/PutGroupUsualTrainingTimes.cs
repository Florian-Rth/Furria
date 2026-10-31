using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Groups;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Groups;

namespace Furria.Api.Endpoints.Groups;

public sealed class PutGroupUsualTrainingTimes : Endpoint<PutGroupUsualTrainingTimesRequest>
{
    private readonly GroupService _groupService;
    private readonly PermissionAuthorizer _authorizer;

    public PutGroupUsualTrainingTimes(GroupService groupService, PermissionAuthorizer authorizer)
    {
        _groupService = groupService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Put("groups/{groupId}/usual-training-times");
    }

    public override async Task HandleAsync(
        PutGroupUsualTrainingTimesRequest req,
        CancellationToken ct
    )
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

        var result = await _groupService.SetUsualTrainingTimesAsync(ToCommand(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static SetGroupUsualTrainingTimesCommand ToCommand(
        PutGroupUsualTrainingTimesRequest req
    ) =>
        new()
        {
            GroupId = req.GroupId,
            UsualTrainingTimes = [.. req.UsualTrainingTimes.Select(ToInput)],
        };

    private static UsualTrainingTimeInput ToInput(UsualTrainingTimeDataDto usualTime) =>
        new()
        {
            Weekday = usualTime.Weekday,
            StartsAt = usualTime.StartsAt,
            DurationMinutes = usualTime.DurationMinutes,
            VenueId = usualTime.VenueId,
        };
}

public sealed record PutGroupUsualTrainingTimesRequest
{
    [RouteParam]
    public required int GroupId { get; init; }

    public required IReadOnlyList<UsualTrainingTimeDataDto> UsualTrainingTimes { get; init; }
}

public sealed record UsualTrainingTimeDataDto
{
    public required DayOfWeek Weekday { get; init; }

    public required TimeOnly StartsAt { get; init; }

    public required int DurationMinutes { get; init; }

    public required int? VenueId { get; init; }
}

public sealed class PutGroupUsualTrainingTimesValidator
    : Validator<PutGroupUsualTrainingTimesRequest>
{
    private const string TooManyUsualTimesMessage =
        "So viele Trainingszeiten passen nicht in eine Woche.";

    public PutGroupUsualTrainingTimesValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0);
        RuleFor(request => request.UsualTrainingTimes).NotNull();
        RuleFor(request => request.UsualTrainingTimes)
            .Must(usualTimes => usualTimes.Count <= GroupLimits.MaxUsualTrainingTimes)
            .WithMessage(TooManyUsualTimesMessage)
            .When(request => request.UsualTrainingTimes is not null);
        RuleForEach(request => request.UsualTrainingTimes)
            .NotNull()
            .SetValidator(new UsualTrainingTimeDataValidator());
    }
}

public sealed class UsualTrainingTimeDataValidator : Validator<UsualTrainingTimeDataDto>
{
    public UsualTrainingTimeDataValidator()
    {
        RuleFor(usualTime => usualTime.Weekday).IsInEnum();
        RuleFor(usualTime => usualTime.DurationMinutes)
            .InclusiveBetween(
                GroupLimits.MinTrainingDurationMinutes,
                GroupLimits.MaxTrainingDurationMinutes
            );
        RuleFor(usualTime => usualTime.VenueId)
            .GreaterThan(0)
            .When(usualTime => usualTime.VenueId is not null);
    }
}
