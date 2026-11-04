using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Core.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PutActVideoClip : Endpoint<PutActVideoClipRequest>
{
    private readonly ActVideoService _videoService;

    public PutActVideoClip(ActVideoService videoService)
    {
        _videoService = videoService;
    }

    public override void Configure()
    {
        Put("acts/{actId}/videos/{videoId}/clip");
    }

    public override async Task HandleAsync(PutActVideoClipRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _videoService.ClipAsync(
            accountId.Value,
            new ActVideoClipCommand
            {
                ActId = req.ActId,
                VideoId = req.VideoId,
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

        await Send.NoContentAsync(ct);
    }
}

public sealed record PutActVideoClipRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int VideoId { get; init; }

    public required double StartSeconds { get; init; }

    public required double EndSeconds { get; init; }
}

public sealed class PutActVideoClipValidator : Validator<PutActVideoClipRequest>
{
    private const string ClipTooShortMessage =
        "Ein Video muss mindestens eine halbe Sekunde lang bleiben.";

    public PutActVideoClipValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.VideoId).GreaterThan(0);
        RuleFor(request => request.StartSeconds).GreaterThanOrEqualTo(0);
        RuleFor(request => request.EndSeconds)
            .Must((request, end) => CutLength.IsLongEnough(request.StartSeconds, end))
            .WithMessage(ClipTooShortMessage);
    }
}
