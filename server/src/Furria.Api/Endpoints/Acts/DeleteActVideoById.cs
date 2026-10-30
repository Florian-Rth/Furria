using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class DeleteActVideoById : Endpoint<DeleteActVideoByIdRequest>
{
    private readonly ActVideoService _videoService;

    public DeleteActVideoById(ActVideoService videoService)
    {
        _videoService = videoService;
    }

    public override void Configure()
    {
        Delete("acts/{actId}/videos/{videoId}");
    }

    public override async Task HandleAsync(DeleteActVideoByIdRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _videoService.RemoveAsync(
            accountId.Value,
            new ActVideoCommand { ActId = req.ActId, VideoId = req.VideoId },
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

public sealed record DeleteActVideoByIdRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int VideoId { get; init; }
}

public sealed class DeleteActVideoByIdValidator : Validator<DeleteActVideoByIdRequest>
{
    public DeleteActVideoByIdValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.VideoId).GreaterThan(0);
    }
}
