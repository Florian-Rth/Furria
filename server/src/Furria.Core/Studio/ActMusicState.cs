using System.Diagnostics.Contracts;
using System.Security.Cryptography;
using System.Text;

namespace Furria.Core.Studio;

public sealed record ActMusicState(
    IReadOnlyList<SongSnapshot> Songs,
    IReadOnlyList<StepAnchors> Steps,
    IReadOnlyList<PlacedVideo> Videos,
    int? ChoreographyVersion
)
{
    [Pure]
    public string Fingerprint() =>
        Convert.ToHexStringLower(
            SHA256.HashData(Encoding.UTF8.GetBytes(string.Join('\n', Lines())))
        );

    [Pure]
    private IEnumerable<string> Lines() =>
        [
            .. Songs.OrderBy(song => song.SongId).Select(LineOf),
            .. Steps.OrderBy(step => step.StepId).Select(LineOf),
            .. Videos.OrderBy(video => video.VideoId).Select(LineOf),
            FormattableString.Invariant($"choreography {ChoreographyVersion}"),
        ];

    [Pure]
    private static string LineOf(SongSnapshot song) =>
        FormattableString.Invariant(
            $"song {song.SongId} {song.MediaItemId} {song.Position} {song.StartSeconds:R} {song.EndSeconds:R} {song.FirstBeatSeconds:R} {song.TempoBpm:R}"
        );

    [Pure]
    private static string LineOf(StepAnchors step) =>
        FormattableString.Invariant(
            $"step {step.StepId} {step.Start.SourceMediaItemId} {step.Start.Seconds:R} {step.End.SourceMediaItemId} {step.End.Seconds:R}"
        );

    [Pure]
    private static string LineOf(PlacedVideo video) =>
        FormattableString.Invariant(
            $"video {video.VideoId} {video.Start.Music.SourceMediaItemId} {video.Start.Music.Seconds:R} {video.Start.VideoSeconds:R}"
        );
}
