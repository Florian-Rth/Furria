using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PostActFinalTrack
    : Endpoint<PostActFinalTrackRequest, PostActFinalTrackResponse>
{
    private readonly ActFinalTrackService _finalTrackService;

    public PostActFinalTrack(ActFinalTrackService finalTrackService)
    {
        _finalTrackService = finalTrackService;
    }

    public override void Configure()
    {
        Post("acts/{actId}/final-tracks");
    }

    public override async Task HandleAsync(PostActFinalTrackRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _finalTrackService.AddAsync(
            accountId.Value,
            new AddActFinalTrackCommand { ActId = req.ActId, MediaItemId = req.MediaItemId },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new PostActFinalTrackResponse { FinalTrackId = result.Value },
            cancellation: ct
        );
    }
}

public sealed record PostActFinalTrackRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    public required int MediaItemId { get; init; }
}

public sealed class PostActFinalTrackValidator : Validator<PostActFinalTrackRequest>
{
    public PostActFinalTrackValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.MediaItemId).GreaterThan(0);
    }
}

public sealed record PostActFinalTrackResponse
{
    public required int FinalTrackId { get; init; }
}
