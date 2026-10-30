using System.Globalization;
using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Infrastructure.Studio;

namespace Furria.Api.Endpoints.Acts;

public sealed class PutActSong : Endpoint<PutActSongRequest>
{
    private readonly ActSongService _songService;

    public PutActSong(ActSongService songService)
    {
        _songService = songService;
    }

    public override void Configure()
    {
        Put("acts/{actId}/songs/{songId}");
    }

    public override async Task HandleAsync(PutActSongRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var result = await _songService.CutAsync(accountId.Value, ToCut(req), ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static ActSongCutCommand ToCut(PutActSongRequest req) =>
        new()
        {
            ActId = req.ActId,
            SongId = req.SongId,
            StartSeconds = req.StartSeconds,
            EndSeconds = req.EndSeconds,
            FirstBeatSeconds = req.FirstBeatSeconds,
            TempoBpm = req.TempoBpm,
        };
}

public sealed record PutActSongRequest
{
    [RouteParam]
    public required int ActId { get; init; }

    [RouteParam]
    public required int SongId { get; init; }

    public required double StartSeconds { get; init; }

    public required double EndSeconds { get; init; }

    public required double? FirstBeatSeconds { get; init; }

    public required double? TempoBpm { get; init; }
}

public sealed class PutActSongValidator : Validator<PutActSongRequest>
{
    private const double ShortestCutSeconds = 2;
    private const double SlowestTempoBpm = 40;
    private const double FastestTempoBpm = 300;

    private static readonly string CutTooShortMessage = string.Create(
        CultureInfo.InvariantCulture,
        $"Ein Lied muss mindestens {ShortestCutSeconds} Sekunden lang bleiben."
    );

    public PutActSongValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.SongId).GreaterThan(0);
        RuleFor(request => request.StartSeconds).GreaterThanOrEqualTo(0);
        RuleFor(request => request.EndSeconds)
            .Must((request, end) => end >= request.StartSeconds + ShortestCutSeconds)
            .WithMessage(CutTooShortMessage);
        RuleFor(request => request.FirstBeatSeconds).GreaterThanOrEqualTo(0);
        RuleFor(request => request.TempoBpm).InclusiveBetween(SlowestTempoBpm, FastestTempoBpm);
    }
}
