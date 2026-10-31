using System.Diagnostics.Contracts;

namespace Furria.Core.Studio;

public sealed class ActMusic
{
    private readonly IReadOnlyList<PlacedCut> _placedCuts;

    public double LengthSeconds { get; }

    public ActMusic(IEnumerable<MusicCut> cuts)
    {
        _placedCuts = Place(cuts);
        LengthSeconds = _placedCuts.Count == 0 ? 0 : _placedCuts[^1].EndsAtSeconds;
    }

    [Pure]
    public static ActMusic Of(MusicCut? adoptedFinalTrack, IEnumerable<MusicCut> songs) =>
        new(adoptedFinalTrack is { } finalTrack ? [finalTrack] : songs);

    [Pure]
    public AnchorPlace Locate(MusicAnchor anchor)
    {
        var placed = _placedCuts.FirstOrDefault(candidate =>
            candidate.Cut.SourceMediaItemId == anchor.SourceMediaItemId
        );

        if (placed is null)
            return AnchorPlace.MusicMissing;

        return placed.Holds(anchor.Seconds)
            ? AnchorPlace.At(placed.TimelineSecondsOf(anchor.Seconds))
            : AnchorPlace.CutAway;
    }

    [Pure]
    public MusicAnchor? AnchorAt(double timelineSeconds)
    {
        var placed =
            _placedCuts.FirstOrDefault(candidate => candidate.Spans(timelineSeconds))
            ?? LastCutEndingAt(timelineSeconds);

        return placed?.AnchorAt(timelineSeconds);
    }

    [Pure]
    public VideoAnchor? VideoAnchorAt(double videoStartSeconds) =>
        videoStartSeconds >= LengthSeconds ? null
        : videoStartSeconds >= 0 ? VideoAnchorOf(AnchorAt(videoStartSeconds), 0)
        : VideoAnchorOf(AnchorAt(0), -videoStartSeconds);

    [Pure]
    public AnchorPlace LocateVideo(VideoAnchor anchor)
    {
        var place = Locate(anchor.Music);
        return place.TimelineSeconds is { } seconds
            ? AnchorPlace.At(seconds - anchor.VideoSeconds)
            : place;
    }

    [Pure]
    private static VideoAnchor? VideoAnchorOf(MusicAnchor? music, double videoSeconds) =>
        music is { } anchor ? new VideoAnchor(anchor, videoSeconds) : null;

    [Pure]
    private PlacedCut? LastCutEndingAt(double timelineSeconds) =>
        _placedCuts.Count > 0 && _placedCuts[^1].EndsAtSeconds == timelineSeconds
            ? _placedCuts[^1]
            : null;

    [Pure]
    private static List<PlacedCut> Place(IEnumerable<MusicCut> cuts)
    {
        var placed = new List<PlacedCut>();
        var offset = 0d;

        foreach (var cut in cuts)
        {
            placed.Add(new PlacedCut(cut, offset));
            offset += cut.LengthSeconds;
        }

        return placed;
    }

    private sealed record PlacedCut(MusicCut Cut, double OffsetSeconds)
    {
        public double EndsAtSeconds => OffsetSeconds + Cut.LengthSeconds;

        [Pure]
        public bool Holds(double sourceSeconds) =>
            sourceSeconds >= Cut.StartSeconds && sourceSeconds <= Cut.EndSeconds;

        [Pure]
        public bool Spans(double timelineSeconds) =>
            timelineSeconds >= OffsetSeconds && timelineSeconds < EndsAtSeconds;

        [Pure]
        public double TimelineSecondsOf(double sourceSeconds) =>
            OffsetSeconds + sourceSeconds - Cut.StartSeconds;

        [Pure]
        public MusicAnchor AnchorAt(double timelineSeconds) =>
            new(Cut.SourceMediaItemId, Cut.StartSeconds + timelineSeconds - OffsetSeconds);
    }
}
