using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class GetActSongReplacement
    : Endpoint<GetActSongReplacementRequest, GetActSongReplacementResponse>
{
    private readonly ActSongReplacementService _replacementService;

    public GetActSongReplacement(ActSongReplacementService replacementService)
    {
        _replacementService = replacementService;
    }

    public override void Configure()
    {
        Get("acts/{actId}/songs/{songId}/replacement");
    }

    public override async Task HandleAsync(GetActSongReplacementRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _replacementService.MatchAsync(
            accountId.Value,
            new ActSongReplacementQuery
            {
                ActId = req.ActId,
                SongId = req.SongId,
                MediaItemId = req.MediaItemId,
            },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(
            new GetActSongReplacementResponse
            {
                Songs =
                [
                    .. result.Value.Select(song => new FoundSongSummaryDto
                    {
                        SongId = song.SongId,
                        StartSeconds = song.StartSeconds,
                        EndSeconds = song.EndSeconds,
                    }),
                ],
            },
            cancellation: ct
        );
    }
}

public sealed record GetActSongReplacementRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int SongId { get; init; }

    [QueryParam]
    public required int MediaItemId { get; init; }
}

public sealed class GetActSongReplacementValidator : Validator<GetActSongReplacementRequest>
{
    public GetActSongReplacementValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.SongId).GreaterThan(0);
        RuleFor(request => request.MediaItemId).GreaterThan(0);
    }
}

public sealed record GetActSongReplacementResponse
{
    public required IReadOnlyList<FoundSongSummaryDto> Songs { get; init; }
}

public sealed record FoundSongSummaryDto
{
    public required int SongId { get; init; }

    public required double StartSeconds { get; init; }

    public required double EndSeconds { get; init; }
}
