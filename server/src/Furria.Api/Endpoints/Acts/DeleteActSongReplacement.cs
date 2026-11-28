using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class DeleteActSongReplacement : Endpoint<DeleteActSongReplacementRequest>
{
    private readonly ActSongReplacementService _replacementService;

    public DeleteActSongReplacement(ActSongReplacementService replacementService)
    {
        _replacementService = replacementService;
    }

    public override void Configure()
    {
        Delete("acts/{actId}/songs/{songId}/replacement");
    }

    public override async Task HandleAsync(
        DeleteActSongReplacementRequest req,
        CancellationToken ct
    )
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _replacementService.UndoAsync(
            accountId.Value,
            new UndoActSongReplacementCommand { ActId = req.ActId, SongId = req.SongId },
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

public sealed record DeleteActSongReplacementRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int SongId { get; init; }
}

public sealed class DeleteActSongReplacementValidator : Validator<DeleteActSongReplacementRequest>
{
    public DeleteActSongReplacementValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.SongId).GreaterThan(0);
    }
}
