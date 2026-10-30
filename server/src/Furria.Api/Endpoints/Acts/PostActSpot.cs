using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PostActSpot : Endpoint<PostActSpotRequest, PostActSpotResponse>
{
    private readonly ActSpotService _spotService;

    public PostActSpot(ActSpotService spotService)
    {
        _spotService = spotService;
    }

    public override void Configure()
    {
        Post("acts/{actId}/spots");
    }

    public override async Task HandleAsync(PostActSpotRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _spotService.AddAsync(accountId.Value, req.ActId, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new PostActSpotResponse { SpotId = result.Value.SpotId, Number = result.Value.Number },
            cancellation: ct
        );
    }
}

public sealed record PostActSpotRequest
{
    [RouteParam]
    public required int ActId { get; init; }
}

public sealed class PostActSpotValidator : Validator<PostActSpotRequest>
{
    public PostActSpotValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
    }
}

public sealed record PostActSpotResponse
{
    public required int SpotId { get; init; }

    public required int Number { get; init; }
}
