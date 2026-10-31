using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Core.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PutActVideo : Endpoint<PutActVideoRequest>
{
    private readonly ActVideoService _videoService;

    public PutActVideo(ActVideoService videoService)
    {
        _videoService = videoService;
    }

    public override void Configure()
    {
        Put("acts/{actId}/videos/{videoId}");
    }

    public override async Task HandleAsync(PutActVideoRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _videoService.RenameAsync(
            accountId.Value,
            new ActVideoNameCommand
            {
                ActId = req.ActId,
                VideoId = req.VideoId,
                Name = req.Name,
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

public sealed record PutActVideoRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int VideoId { get; init; }

    public required string? Name { get; init; }
}

public sealed class PutActVideoValidator : Validator<PutActVideoRequest>
{
    public PutActVideoValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.VideoId).GreaterThan(0);
        RuleFor(request => request.Name).MaximumLength(ActVideo.NameLength);
    }
}
