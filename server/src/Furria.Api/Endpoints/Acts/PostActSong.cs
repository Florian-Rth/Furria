using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PostActSong : Endpoint<PostActSongRequest, PostActSongResponse>
{
    private readonly ActSongService _songService;

    public PostActSong(ActSongService songService)
    {
        _songService = songService;
    }

    public override void Configure()
    {
        Post("acts/{actId}/songs");
    }

    public override async Task HandleAsync(PostActSongRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _songService.AddAsync(
            accountId.Value,
            new AddActSongCommand { ActId = req.ActId, MediaItemId = req.MediaItemId },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(new PostActSongResponse { SongId = result.Value }, cancellation: ct);
    }
}

public sealed record PostActSongRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    public required int MediaItemId { get; init; }
}

public sealed class PostActSongValidator : Validator<PostActSongRequest>
{
    public PostActSongValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.MediaItemId).GreaterThan(0);
    }
}

public sealed record PostActSongResponse
{
    public required int SongId { get; init; }
}
