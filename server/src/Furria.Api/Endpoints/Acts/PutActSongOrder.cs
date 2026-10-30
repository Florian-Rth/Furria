using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Core.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PutActSongOrder : Endpoint<PutActSongOrderRequest>
{
    private readonly ActSongService _songService;

    public PutActSongOrder(ActSongService songService)
    {
        _songService = songService;
    }

    public override void Configure()
    {
        Put("acts/{actId}/songs/order");
    }

    public override async Task HandleAsync(PutActSongOrderRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _songService.OrderAsync(
            accountId.Value,
            new ActSongOrderCommand { ActId = req.ActId, SongIds = req.SongIds },
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

public sealed record PutActSongOrderRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    public required IReadOnlyList<int> SongIds { get; init; }
}

public sealed class PutActSongOrderValidator : Validator<PutActSongOrderRequest>
{
    public PutActSongOrderValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.SongIds)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .Must(songIds => songIds.Count <= ActSong.MostPerAct);
    }
}
