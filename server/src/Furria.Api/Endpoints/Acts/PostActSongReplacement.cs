using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Core.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PostActSongReplacement
    : Endpoint<PostActSongReplacementRequest, PostActSongReplacementResponse>
{
    private readonly ActSongReplacementService _replacementService;

    public PostActSongReplacement(ActSongReplacementService replacementService)
    {
        _replacementService = replacementService;
    }

    public override void Configure()
    {
        Post("acts/{actId}/songs/{songId}/replacement");
    }

    public override async Task HandleAsync(PostActSongReplacementRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _replacementService.ReplaceAsync(
            accountId.Value,
            new ReplaceActSongCommand
            {
                ActId = req.ActId,
                SongId = req.SongId,
                MediaItemId = req.MediaItemId,
                WithSongIds = req.WithSongIds,
            },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new PostActSongReplacementResponse { SongId = result.Value },
            cancellation: ct
        );
    }
}

public sealed record PostActSongReplacementRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int SongId { get; init; }

    public required int MediaItemId { get; init; }

    public required IReadOnlyList<int> WithSongIds { get; init; }
}

public sealed class PostActSongReplacementValidator : Validator<PostActSongReplacementRequest>
{
    public PostActSongReplacementValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.SongId).GreaterThan(0);
        RuleFor(request => request.MediaItemId).GreaterThan(0);
        RuleFor(request => request.WithSongIds)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .Must(songIds => songIds.Count < ActSong.MostPerAct)
            .Must(songIds => songIds.Distinct().Count() == songIds.Count);
        RuleForEach(request => request.WithSongIds)
            .GreaterThan(0)
            .NotEqual(request => request.SongId);
    }
}

public sealed record PostActSongReplacementResponse
{
    public required int SongId { get; init; }
}
