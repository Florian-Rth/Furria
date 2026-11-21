using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Intakes;
using Furria.Infrastructure.Intakes;

namespace Furria.Api.Endpoints.Intakes;

public sealed class RenewIntake : Endpoint<RenewIntakeRequest, RenewIntakeResponse>
{
    private readonly IntakeService _intakeService;

    public RenewIntake(IntakeService intakeService)
    {
        _intakeService = intakeService;
    }

    public override void Configure()
    {
        Post("intakes/{intakeId}/renew");
    }

    public override async Task HandleAsync(RenewIntakeRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _intakeService.RenewAsync(accountId.Value, req.IntakeId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(result.Value), cancellation: ct);
    }

    private static RenewIntakeResponse ToResponse(IntakeLinkDetails link) =>
        new() { Token = link.Token, ExpiresAt = link.ExpiresAt };
}

public sealed record RenewIntakeRequest
{
    [RouteParam]
    public required int IntakeId { get; init; }
}

public sealed class RenewIntakeValidator : Validator<RenewIntakeRequest>
{
    public RenewIntakeValidator()
    {
        RuleFor(request => request.IntakeId).GreaterThan(0);
    }
}

public sealed record RenewIntakeResponse
{
    public required string Token { get; init; }

    public required DateTimeOffset ExpiresAt { get; init; }
}
