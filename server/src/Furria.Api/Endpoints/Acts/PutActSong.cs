using System.Globalization;
using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Studio;
using Furria.Core.Studio;
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
            Pieces =
            [
                .. req.Pieces.Select(piece => new SongPiece(piece.StartSeconds, piece.EndSeconds)),
            ],
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

    public required IReadOnlyList<SongPieceDataDto> Pieces { get; init; }

    public required double? FirstBeatSeconds { get; init; }

    public required double? TempoBpm { get; init; }
}

public sealed record SongPieceDataDto
{
    public required double StartSeconds { get; init; }

    public required double EndSeconds { get; init; }
}

public sealed class PutActSongValidator : Validator<PutActSongRequest>
{
    private const double SlowestTempoBpm = 40;
    private const double FastestTempoBpm = 300;
    private const string OverlapMessage =
        "Die Stücke eines Lieds folgen aufeinander und überlappen sich nicht.";

    private static readonly string PieceTooShortMessage = string.Create(
        CultureInfo.InvariantCulture,
        $"Ein Stück muss mindestens {CutLength.ShortestSeconds} Sekunden lang bleiben."
    );

    private static readonly string TooManyPiecesMessage = string.Create(
        CultureInfo.InvariantCulture,
        $"Ein Lied hat höchstens {SongPiece.MostPerSong} Stücke."
    );

    public PutActSongValidator()
    {
        RuleFor(request => request.ActId).GreaterThan(0);
        RuleFor(request => request.SongId).GreaterThan(0);
        RuleFor(request => request.Pieces)
            .Cascade(CascadeMode.Stop)
            .NotEmpty()
            .Must(pieces => pieces.Count <= SongPiece.MostPerSong)
            .WithMessage(TooManyPiecesMessage)
            .Must(FollowEachOther)
            .WithMessage(OverlapMessage);
        RuleForEach(request => request.Pieces)
            .ChildRules(piece =>
            {
                piece.RuleFor(cut => cut.StartSeconds).GreaterThanOrEqualTo(0);
                piece
                    .RuleFor(cut => cut.EndSeconds)
                    .Must((cut, end) => CutLength.IsLongEnough(cut.StartSeconds, end))
                    .WithMessage(PieceTooShortMessage);
            });
        RuleFor(request => request.FirstBeatSeconds).GreaterThanOrEqualTo(0);
        RuleFor(request => request.TempoBpm).InclusiveBetween(SlowestTempoBpm, FastestTempoBpm);
    }

    private static bool FollowEachOther(IReadOnlyList<SongPieceDataDto> pieces) =>
        pieces.Zip(pieces.Skip(1)).All(pair => pair.Second.StartSeconds >= pair.First.EndSeconds);
}
