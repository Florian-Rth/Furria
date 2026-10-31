using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Core.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PutActStep : Endpoint<PutActStepRequest>
{
    private readonly ActStepService _stepService;

    public PutActStep(ActStepService stepService)
    {
        _stepService = stepService;
    }

    public override void Configure()
    {
        Put("acts/{actId}/steps/{stepId}");
    }

    public override async Task HandleAsync(PutActStepRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _stepService.DescribeAsync(
            accountId.Value,
            new ActStepTextCommand
            {
                ActId = req.ActId,
                StepId = req.StepId,
                Name = req.Name,
                Description = req.Description,
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

public sealed record PutActStepRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int StepId { get; init; }

    public required string Name { get; init; }

    public required string? Description { get; init; }
}

public sealed class PutActStepValidator : Validator<PutActStepRequest>
{
    public PutActStepValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.StepId).GreaterThan(0);
        RuleFor(request => request.Name).NotNull().MaximumLength(ActStep.NameLength);
        RuleFor(request => request.Description).MaximumLength(ActStep.DescriptionLength);
    }
}
