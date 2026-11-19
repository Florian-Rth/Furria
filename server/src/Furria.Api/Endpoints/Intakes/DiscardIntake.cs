using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Infrastructure.Intakes;

namespace Furria.Api.Endpoints.Intakes;

public sealed class DiscardIntake : Endpoint<DiscardIntakeRequest>
{
    private readonly IntakeService _intakeService;

    public DiscardIntake(IntakeService intakeService)
    {
        _intakeService = intakeService;
    }

    public override void Configure()
    {
        Post("intakes/{intakeId}/discard");
    }

    public override async Task HandleAsync(DiscardIntakeRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _intakeService.DiscardAsync(accountId.Value, req.IntakeId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record DiscardIntakeRequest
{
    [RouteParam]
    public required int IntakeId { get; init; }
}

public sealed class DiscardIntakeValidator : Validator<DiscardIntakeRequest>
{
    public DiscardIntakeValidator()
    {
        RuleFor(request => request.IntakeId).GreaterThan(0);
    }
}
