using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PostActVideoAlignment
    : Endpoint<PostActVideoAlignmentRequest, PostActVideoAlignmentResponse>
{
    private readonly ActVideoService _videoService;

    public PostActVideoAlignment(ActVideoService videoService)
    {
        _videoService = videoService;
    }

    public override void Configure()
    {
        Post("acts/{actId}/videos/{videoId}/alignment");
    }

    public override async Task HandleAsync(PostActVideoAlignmentRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _videoService.AlignAsync(
            accountId.Value,
            new ActVideoCommand { ActId = req.ActId, VideoId = req.VideoId },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new PostActVideoAlignmentResponse
            {
                StartSeconds = result.Value.StartSeconds,
                Confidence = result.Value.Confidence,
            },
            cancellation: ct
        );
    }
}

public sealed record PostActVideoAlignmentRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int VideoId { get; init; }
}

public sealed class PostActVideoAlignmentValidator : Validator<PostActVideoAlignmentRequest>
{
    public PostActVideoAlignmentValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.VideoId).GreaterThan(0);
    }
}

public sealed record PostActVideoAlignmentResponse
{
    public required double StartSeconds { get; init; }

    public required double Confidence { get; init; }
}
