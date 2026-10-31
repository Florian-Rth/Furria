using System.Diagnostics.Contracts;

namespace Furria.Core.Studio;

public sealed class FinalTrackAdoption
{
    private readonly int _finalMediaItemId;
    private readonly double _lengthSeconds;
    private readonly IReadOnlyDictionary<int, FinalTrackPlacement> _placementsBySource;

    public FinalTrackAdoption(
        int finalMediaItemId,
        double lengthSeconds,
        IReadOnlyDictionary<int, FinalTrackPlacement> placementsBySource
    )
    {
        _finalMediaItemId = finalMediaItemId;
        _lengthSeconds = lengthSeconds;
        _placementsBySource = placementsBySource;
    }

    public bool MatchesAnyMusic => _placementsBySource.Count > 0;

    [Pure]
    public MusicAnchor Rewritten(MusicAnchor anchor) =>
        FinalSecondsOf(anchor) is { } seconds
            ? new MusicAnchor(_finalMediaItemId, Math.Max(0, seconds))
            : anchor;

    [Pure]
    public VideoAnchor Rewritten(VideoAnchor anchor)
    {
        if (FinalSecondsOf(anchor.Music) is not { } seconds)
            return anchor;

        var videoStart = seconds - anchor.VideoSeconds;
        return videoStart >= 0
            ? new VideoAnchor(new MusicAnchor(_finalMediaItemId, videoStart), 0)
            : new VideoAnchor(new MusicAnchor(_finalMediaItemId, 0), -videoStart);
    }

    [Pure]
    public ChoreographyDocument Rewritten(ChoreographyDocument document) =>
        new([
            .. document.Tracks.Select(track =>
                track with
                {
                    Keyframes =
                    [
                        .. track.Keyframes.Select(keyframe =>
                            keyframe with
                            {
                                At = Rewritten(keyframe.At),
                            }
                        ),
                    ],
                }
            ),
        ]);

    [Pure]
    private double? FinalSecondsOf(MusicAnchor anchor) =>
        _placementsBySource.TryGetValue(anchor.SourceMediaItemId, out var placement)
        && placement.FinalSecondsOf(anchor.Seconds) is var seconds
        && seconds <= _lengthSeconds
            ? seconds
            : null;
}
