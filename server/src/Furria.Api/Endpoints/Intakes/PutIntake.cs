using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Intakes;
using Furria.Core.Intakes;
using Furria.Infrastructure.Intakes;

namespace Furria.Api.Endpoints.Intakes;

public sealed class PutIntake : Endpoint<PutIntakeRequest>
{
    private readonly IntakeService _intakeService;

    public PutIntake(IntakeService intakeService)
    {
        _intakeService = intakeService;
    }

    public override void Configure()
    {
        Put("intakes/{intakeId}");
    }

    public override async Task HandleAsync(PutIntakeRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _intakeService.EditAsync(ToCommand(req, accountId.Value), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static EditIntakeCommand ToCommand(PutIntakeRequest req, int accountId) =>
        new()
        {
            ActorAccountId = accountId,
            IntakeId = req.IntakeId,
            MemberFrom = req.MemberFrom,
            GroupIds = req.GroupIds,
            Label = req.Label,
        };
}

public sealed record PutIntakeRequest
{
    [RouteParam]
    public required int IntakeId { get; init; }

    public required DateOnly? MemberFrom { get; init; }

    public required IReadOnlyList<int> GroupIds { get; init; }

    public string? Label { get; init; }
}

public sealed class PutIntakeValidator : Validator<PutIntakeRequest>
{
    public PutIntakeValidator()
    {
        RuleFor(request => request.IntakeId).GreaterThan(0);
        RuleForEach(request => request.GroupIds).GreaterThan(0);
        RuleFor(request => request.GroupIds)
            .NotNull()
            .Must(groupIds => groupIds is null || groupIds.Distinct().Count() == groupIds.Count);
        RuleFor(request => request.Label).MaximumLength(Intake.LabelLength);
    }
}
