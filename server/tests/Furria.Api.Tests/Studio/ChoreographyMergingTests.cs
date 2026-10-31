using Furria.Core.Studio;
using Xunit;

namespace Furria.Api.Tests.Studio;

public sealed class ChoreographyMergingTests
{
    private const int Opener = 11;
    private const int Finale = 12;
    private const int SpotOne = 1;
    private const int SpotTwo = 2;
    private const int SpotThree = 3;

    private static readonly ActMusic Music = new([
        new MusicCut(Opener, 10, 40),
        new MusicCut(Finale, 5, 25),
    ]);

    [Fact]
    public void Should_TakeTheChangedTrack_When_NobodyElseTouchedItsSpot()
    {
        var baseline = Document(
            Track(SpotOne, At(Opener, 10, 0)),
            Track(SpotTwo, At(Opener, 10, 1))
        );
        var current = Document(
            Track(SpotOne, At(Opener, 10, 0)),
            Track(SpotTwo, At(Opener, 10, 2))
        );

        var merge = ChoreographyMerging.Merged(
            baseline,
            current,
            [Track(SpotOne, At(Opener, 10, 3), At(Opener, 20, 4))],
            Music
        );

        Assert.Equal(
            Document(
                Track(SpotOne, At(Opener, 10, 3), At(Opener, 20, 4)),
                Track(SpotTwo, At(Opener, 10, 2))
            ),
            merge.Document,
            DocumentComparer.Instance
        );
        Assert.Empty(merge.Overlaps);
    }

    [Fact]
    public void Should_KeepTheOtherChange_When_ThePatchRepeatsTheBaseTrack()
    {
        var baseline = Document(Track(SpotOne, At(Opener, 10, 0)));
        var current = Document(Track(SpotOne, At(Opener, 10, 5)));

        var merge = ChoreographyMerging.Merged(
            baseline,
            current,
            [Track(SpotOne, At(Opener, 10, 0))],
            Music
        );

        Assert.Equal(current, merge.Document, DocumentComparer.Instance);
        Assert.Empty(merge.Overlaps);
    }

    [Fact]
    public void Should_MergeKeyframesInMusicOrder_When_BothSidesChangedDifferentKeyframesOfOneSpot()
    {
        var baseline = Document(Track(SpotOne, At(Opener, 10, 0), At(Opener, 30, 0)));
        var current = Document(Track(SpotOne, At(Opener, 10, 1), At(Opener, 30, 0)));

        var merge = ChoreographyMerging.Merged(
            baseline,
            current,
            [Track(SpotOne, At(Opener, 10, 0), At(Finale, 5, 2), At(Opener, 20, 3))],
            Music
        );

        Assert.Equal(
            Document(Track(SpotOne, At(Opener, 10, 1), At(Opener, 20, 3), At(Finale, 5, 2))),
            merge.Document,
            DocumentComparer.Instance
        );
        Assert.Empty(merge.Overlaps);
    }

    [Fact]
    public void Should_ReportTheKeyframe_When_BothSidesChangedItDifferently()
    {
        var baseline = Document(Track(SpotOne, At(Opener, 10, 0), At(Opener, 20, 0)));
        var current = Document(Track(SpotOne, At(Opener, 10, 1), At(Opener, 20, 0)));

        var merge = ChoreographyMerging.Merged(
            baseline,
            current,
            [Track(SpotOne, At(Opener, 10, 2), At(Opener, 20, 3))],
            Music
        );

        var overlap = Assert.Single(merge.Overlaps);
        Assert.Equal(SpotOne, overlap.SpotId);
        Assert.Equal([new MusicAnchor(Opener, 10)], overlap.Keyframes);
        Assert.Equal(current, merge.Document, DocumentComparer.Instance);
    }

    [Fact]
    public void Should_ReportTheKeyframe_When_OneSideRemovedWhatTheOtherMoved()
    {
        var baseline = Document(Track(SpotOne, At(Opener, 10, 0), At(Opener, 20, 0)));
        var current = Document(Track(SpotOne, At(Opener, 10, 0)));

        var merge = ChoreographyMerging.Merged(
            baseline,
            current,
            [Track(SpotOne, At(Opener, 10, 0), At(Opener, 20, 4))],
            Music
        );

        Assert.Equal(
            [new MusicAnchor(Opener, 20)],
            Assert.Single(merge.Overlaps).Keyframes.ToArray()
        );
    }

    [Fact]
    public void Should_AcceptTheSameChange_When_BothSidesMadeIt()
    {
        var baseline = Document(Track(SpotOne, At(Opener, 10, 0), At(Opener, 20, 0)));
        var current = Document(Track(SpotOne, At(Opener, 10, 4), At(Opener, 20, 0)));

        var merge = ChoreographyMerging.Merged(
            baseline,
            current,
            [Track(SpotOne, At(Opener, 10, 4), At(Opener, 20, 1))],
            Music
        );

        Assert.Equal(
            Document(Track(SpotOne, At(Opener, 10, 4), At(Opener, 20, 1))),
            merge.Document,
            DocumentComparer.Instance
        );
        Assert.Empty(merge.Overlaps);
    }

    [Fact]
    public void Should_AddTheTrack_When_ItsSpotHadNoneOnEitherSide()
    {
        var baseline = Document(Track(SpotOne, At(Opener, 10, 0)));

        var merge = ChoreographyMerging.Merged(
            baseline,
            baseline,
            [Track(SpotThree, At(Opener, 10, 2))],
            Music
        );

        Assert.Equal(
            Document(Track(SpotOne, At(Opener, 10, 0)), Track(SpotThree, At(Opener, 10, 2))),
            merge.Document,
            DocumentComparer.Instance
        );
    }

    [Fact]
    public void Should_ReportTheSpot_When_ItsTrackWasDroppedWhileThePatchChangedIt()
    {
        var baseline = Document(
            Track(SpotOne, At(Opener, 10, 0)),
            Track(SpotTwo, At(Opener, 10, 1))
        );
        var current = Document(Track(SpotOne, At(Opener, 10, 0)));

        var merge = ChoreographyMerging.Merged(
            baseline,
            current,
            [Track(SpotTwo, At(Opener, 10, 1), At(Opener, 20, 2))],
            Music
        );

        var overlap = Assert.Single(merge.Overlaps);
        Assert.Equal(SpotTwo, overlap.SpotId);
        Assert.Equal([new MusicAnchor(Opener, 20)], overlap.Keyframes);
    }

    [Fact]
    public void Should_KeepTheSentOrder_When_TheWholeTrackIsTaken()
    {
        var baseline = Document();

        var merge = ChoreographyMerging.Merged(
            baseline,
            baseline,
            [Track(SpotOne, At(Opener, 10, 0), At(Opener, 99, 1), At(Opener, 5, 2))],
            Music
        );

        Assert.Equal(
            Document(Track(SpotOne, At(Opener, 10, 0), At(Opener, 99, 1), At(Opener, 5, 2))),
            merge.Document,
            DocumentComparer.Instance
        );
    }

    private static ChoreographyDocument Document(params SpotTrack[] tracks) => new(tracks);

    private static SpotTrack Track(int spotId, params Keyframe[] keyframes) =>
        new(spotId, keyframes);

    private static Keyframe At(int source, double seconds, double right) =>
        new(
            new MusicAnchor(source, seconds),
            new StagePoint(right, 1),
            null,
            KeyframeEasing.Linear,
            null
        );

    private sealed class DocumentComparer : IEqualityComparer<ChoreographyDocument>
    {
        public static readonly DocumentComparer Instance = new();

        public bool Equals(ChoreographyDocument? left, ChoreographyDocument? right) =>
            left is not null
            && right is not null
            && left.Tracks.Count == right.Tracks.Count
            && left.Tracks.Zip(right.Tracks)
                .All(pair =>
                    pair.First.SpotId == pair.Second.SpotId
                    && pair.First.Keyframes.SequenceEqual(pair.Second.Keyframes)
                );

        public int GetHashCode(ChoreographyDocument document) => document.Tracks.Count;
    }
}
