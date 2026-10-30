using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class DeleteActSongById : Endpoint<DeleteActSongByIdRequest>
{
    private readonly ActSongService _songService;

    public DeleteActSongById(ActSongService songService)
    {
        _songService = songService;
    }

    public override void Configure()
    {
        Delete("acts/{actId}/songs/{songId}");
    }

    public override async Task HandleAsync(DeleteActSongByIdRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _songService.RemoveAsync(
            accountId.Value,
            new RemoveActSongCommand { ActId = req.ActId, SongId = req.SongId },
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

public sealed record DeleteActSongByIdRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int SongId { get; init; }
}

public sealed class DeleteActSongByIdValidator : Validator<DeleteActSongByIdRequest>
{
    public DeleteActSongByIdValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.SongId).GreaterThan(0);
    }
}
