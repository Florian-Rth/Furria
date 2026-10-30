using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class DeleteActStepById : Endpoint<DeleteActStepByIdRequest>
{
    private readonly ActStepService _stepService;

    public DeleteActStepById(ActStepService stepService)
    {
        _stepService = stepService;
    }

    public override void Configure()
    {
        Delete("acts/{actId}/steps/{stepId}");
    }

    public override async Task HandleAsync(DeleteActStepByIdRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _stepService.RemoveAsync(
            accountId.Value,
            new RemoveActStepCommand { ActId = req.ActId, StepId = req.StepId },
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

public sealed record DeleteActStepByIdRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int StepId { get; init; }
}

public sealed class DeleteActStepByIdValidator : Validator<DeleteActStepByIdRequest>
{
    public DeleteActStepByIdValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.StepId).GreaterThan(0);
    }
}
