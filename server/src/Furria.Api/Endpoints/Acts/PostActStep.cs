using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PostActStep : Endpoint<PostActStepRequest, PostActStepResponse>
{
    private readonly ActStepService _stepService;

    public PostActStep(ActStepService stepService)
    {
        _stepService = stepService;
    }

    public override void Configure()
    {
        Post("acts/{actId}/steps");
    }

    public override async Task HandleAsync(PostActStepRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _stepService.CreateAsync(
            accountId.Value,
            new CreateActStepCommand
            {
                ActId = req.ActId,
                StartSeconds = req.StartSeconds,
                EndSeconds = req.EndSeconds,
            },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(new PostActStepResponse { StepId = result.Value }, cancellation: ct);
    }
}

public sealed record PostActStepRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    public required double StartSeconds { get; init; }

    public required double EndSeconds { get; init; }
}

public sealed class PostActStepValidator : Validator<PostActStepRequest>
{
    public PostActStepValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.StartSeconds).GreaterThanOrEqualTo(0);
        RuleFor(request => request.EndSeconds).GreaterThan(request => request.StartSeconds);
    }
}

public sealed record PostActStepResponse
{
    public required int StepId { get; init; }
}
