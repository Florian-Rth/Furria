using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Intakes;
using Furria.Infrastructure.Intakes;

namespace Furria.Api.Endpoints.Intakes;

public sealed class ResolveIntake : Endpoint<ResolveIntakeRequest, ResolveIntakeResponse>
{
    private readonly IntakeService _intakeService;

    public ResolveIntake(IntakeService intakeService)
    {
        _intakeService = intakeService;
    }

    public override void Configure()
    {
        Post("intakes/{intakeId}/resolve");
    }

    public override async Task HandleAsync(ResolveIntakeRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _intakeService.ResolveAsync(
            new ResolveIntakeCommand
            {
                ActorAccountId = accountId.Value,
                IntakeId = req.IntakeId,
                PersonId = req.PersonId,
            },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(new ResolveIntakeResponse { PersonId = result.Value }, cancellation: ct);
    }
}

public sealed record ResolveIntakeRequest
{
    [RouteParam]
    public required int IntakeId { get; init; }

    public int? PersonId { get; init; }
}

public sealed class ResolveIntakeValidator : Validator<ResolveIntakeRequest>
{
    public ResolveIntakeValidator()
    {
        RuleFor(request => request.IntakeId).GreaterThan(0);
        RuleFor(request => request.PersonId)
            .GreaterThan(0)
            .When(request => request.PersonId is not null);
    }
}

public sealed record ResolveIntakeResponse
{
    public required int PersonId { get; init; }
}
