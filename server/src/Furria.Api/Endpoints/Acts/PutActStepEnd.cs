using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PutActStepEnd : Endpoint<PutActStepEndRequest>
{
    private readonly ActStepService _stepService;

    public PutActStepEnd(ActStepService stepService)
    {
        _stepService = stepService;
    }

    public override void Configure()
    {
        Put("acts/{actId}/steps/{stepId}/end");
    }

    public override async Task HandleAsync(PutActStepEndRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _stepService.MoveEndAsync(
            accountId.Value,
            new MoveActStepCommand
            {
                ActId = req.ActId,
                StepId = req.StepId,
                AtSeconds = req.AtSeconds,
            },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record PutActStepEndRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int StepId { get; init; }

    public required double AtSeconds { get; init; }
}

public sealed class PutActStepEndValidator : Validator<PutActStepEndRequest>
{
    public PutActStepEndValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.StepId).GreaterThan(0);
        RuleFor(request => request.AtSeconds).GreaterThan(0);
    }
}
