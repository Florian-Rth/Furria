using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PostActSongSplit : Endpoint<PostActSongSplitRequest, PostActSongSplitResponse>
{
    private readonly ActSongService _songService;

    public PostActSongSplit(ActSongService songService)
    {
        _songService = songService;
    }

    public override void Configure()
    {
        Post("acts/{actId}/songs/{songId}/split");
    }

    public override async Task HandleAsync(PostActSongSplitRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _songService.SplitAsync(
            accountId.Value,
            new SplitActSongCommand
            {
                ActId = req.ActId,
                SongId = req.SongId,
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
            new PostActSongSplitResponse { SongId = result.Value },
            cancellation: ct
        );
    }
}

public sealed record PostActSongSplitRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int SongId { get; init; }

    public required double AtSeconds { get; init; }
}

public sealed class PostActSongSplitValidator : Validator<PostActSongSplitRequest>
{
    public PostActSongSplitValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.SongId).GreaterThan(0);
        RuleFor(request => request.AtSeconds).GreaterThan(0);
    }
}

public sealed record PostActSongSplitResponse
{
    public required int SongId { get; init; }
}
