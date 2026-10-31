using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PostActFinalTrackAdoption : Endpoint<PostActFinalTrackAdoptionRequest>
{
    private readonly ActFinalTrackService _finalTrackService;

    public PostActFinalTrackAdoption(ActFinalTrackService finalTrackService)
    {
        _finalTrackService = finalTrackService;
    }

    public override void Configure()
    {
        Post("acts/{actId}/final-tracks/{finalTrackId}/adoption");
    }

    public override async Task HandleAsync(
        PostActFinalTrackAdoptionRequest req,
        CancellationToken ct
    )
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _finalTrackService.AdoptAsync(
            accountId.Value,
            new ActFinalTrackCommand { ActId = req.ActId, FinalTrackId = req.FinalTrackId },
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

public sealed record PostActFinalTrackAdoptionRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int FinalTrackId { get; init; }
}

public sealed class PostActFinalTrackAdoptionValidator : Validator<PostActFinalTrackAdoptionRequest>
{
    public PostActFinalTrackAdoptionValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.FinalTrackId).GreaterThan(0);
    }
}
