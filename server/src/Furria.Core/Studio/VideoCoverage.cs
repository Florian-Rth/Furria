using System.Diagnostics.Contracts;

namespace Furria.Core.Studio;

public static class VideoCoverage
{
    public const double ToleranceSeconds = 1;

    [Pure]
    public static IReadOnlySet<int> OutdatedOf(IReadOnlyList<VideoSpan> videos) =>
        videos
            .Where(older =>
                videos.Any(newer => newer.VideoId > older.VideoId && Covers(newer, older))
            )
            .Select(older => older.VideoId)
            .ToHashSet();

    [Pure]
    public static VideoSpan? SpanOf(int videoId, AnchorPlace? place, double? durationSeconds) =>
        place?.TimelineSeconds is { } start && durationSeconds is > 0
            ? new VideoSpan(videoId, start, start + durationSeconds.Value)
            : null;

    [Pure]
    public static bool CoversMostOf(VideoSpan video, double startSeconds, double endSeconds)
    {
        var overlap =
            Math.Min(video.EndSeconds, endSeconds) - Math.Max(video.StartSeconds, startSeconds);
        return endSeconds > startSeconds && overlap * 2 >= endSeconds - startSeconds;
    }

    [Pure]
    private static bool Covers(VideoSpan newer, VideoSpan older) =>
        newer.StartSeconds <= older.StartSeconds + ToleranceSeconds
        && newer.EndSeconds >= older.EndSeconds - ToleranceSeconds;
}
