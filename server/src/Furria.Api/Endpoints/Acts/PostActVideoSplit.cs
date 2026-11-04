using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PostActVideoSplit
    : Endpoint<PostActVideoSplitRequest, PostActVideoSplitResponse>
{
    private readonly ActVideoService _videoService;

    public PostActVideoSplit(ActVideoService videoService)
    {
        _videoService = videoService;
    }

    public override void Configure()
    {
        Post("acts/{actId}/videos/{videoId}/split");
    }

    public override async Task HandleAsync(PostActVideoSplitRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _videoService.SplitAsync(
            accountId.Value,
            new SplitActVideoCommand
            {
                ActId = req.ActId,
                VideoId = req.VideoId,
                AtSeconds = req.AtSeconds,
            },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new PostActVideoSplitResponse { VideoId = result.Value },
            cancellation: ct
        );
    }
}

public sealed record PostActVideoSplitRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int VideoId { get; init; }

    public required double AtSeconds { get; init; }
}

public sealed class PostActVideoSplitValidator : Validator<PostActVideoSplitRequest>
{
    public PostActVideoSplitValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.VideoId).GreaterThan(0);
        RuleFor(request => request.AtSeconds).GreaterThan(0);
    }
}

public sealed record PostActVideoSplitResponse
{
    public required int VideoId { get; init; }
}
