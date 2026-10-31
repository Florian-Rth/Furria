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

        var result = await _stepService.MarkAsync(
            accountId.Value,
            new MarkActStepCommand { ActId = req.ActId, AtSeconds = req.AtSeconds },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(new PostActStepResponse { StepIds = result.Value }, cancellation: ct);
    }
}

public sealed record PostActStepRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    public required double AtSeconds { get; init; }
}

public sealed class PostActStepValidator : Validator<PostActStepRequest>
{
    public PostActStepValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.AtSeconds).GreaterThanOrEqualTo(0);
    }
}

public sealed record PostActStepResponse
{
    public required IReadOnlyList<int> StepIds { get; init; }
}
