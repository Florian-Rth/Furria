using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PutActVideoStart : Endpoint<PutActVideoStartRequest>
{
    private readonly ActVideoService _videoService;

    public PutActVideoStart(ActVideoService videoService)
    {
        _videoService = videoService;
    }

    public override void Configure()
    {
        Put("acts/{actId}/videos/{videoId}/start");
    }

    public override async Task HandleAsync(PutActVideoStartRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _videoService.PlaceAsync(
            accountId.Value,
            new PlaceActVideoCommand
            {
                ActId = req.ActId,
                VideoId = req.VideoId,
                StartSeconds = req.AtSeconds,
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

public sealed record PutActVideoStartRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int VideoId { get; init; }

    public required double AtSeconds { get; init; }
}

public sealed class PutActVideoStartValidator : Validator<PutActVideoStartRequest>
{
    public PutActVideoStartValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.VideoId).GreaterThan(0);
        RuleFor(request => request.AtSeconds).Must(double.IsFinite);
    }
}
