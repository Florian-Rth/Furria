using System.Diagnostics.Contracts;
using Furria.Core.Sound;

namespace Furria.Core.Studio;

public static class SongMatching
{
    public const double LeastConfidence = 0.35;
    public const double MostTempoChange = 0.05;

    [Pure]
    public static FoundSong? FoundIn(SoundProfile newFile, CutSound song)
    {
        var heard = song.Profile.Excerpt(song.Cut.StartSeconds, song.Cut.EndSeconds);
        var alignment = SoundComparison.AlignStretched(newFile, heard, MostTempoChange);

        return alignment is { Confidence: >= LeastConfidence }
            ? new FoundSong(
                song.Cut,
                new SongPlacement(
                    alignment.OffsetSeconds - song.Cut.StartSeconds * alignment.Stretch,
                    alignment.Stretch
                )
            )
            : null;
    }

    [Pure]
    public static SongRun? RunAround(
        SoundProfile newFile,
        IReadOnlyList<CutSound?> chain,
        int songIndex
    )
    {
        if (chain[songIndex] is not { } asked || FoundIn(newFile, asked) is not { } song)
            return null;

        var before = FoundWhileInOrder(newFile, chain.Take(songIndex).Reverse(), song, PlaysBefore);
        var after = FoundWhileInOrder(newFile, chain.Skip(songIndex + 1), song, PlaysAfter);

        return new SongRun(
            songIndex - before.Count,
            [.. Enumerable.Reverse(before), song, .. after]
        );
    }

    [Pure]
    public static IReadOnlyList<FoundSong>? FoundInOrder(
        SoundProfile newFile,
        IReadOnlyList<CutSound> run
    )
    {
        if (FoundIn(newFile, run[0]) is not { } first)
            return null;

        var rest = FoundWhileInOrder(newFile, run.Skip(1), first, PlaysAfter);

        return rest.Count == run.Count - 1 ? [first, .. rest] : null;
    }

    [Pure]
    private static List<FoundSong> FoundWhileInOrder(
        SoundProfile newFile,
        IEnumerable<CutSound?> neighbours,
        FoundSong song,
        Func<FoundSong, FoundSong, bool> keepsOrder
    )
    {
        var found = new List<FoundSong>();
        foreach (var neighbour in neighbours)
        {
            var edge = found.Count > 0 ? found[^1] : song;
            if (
                neighbour is null
                || FoundIn(newFile, neighbour) is not { } next
                || !keepsOrder(next, edge)
            )
                break;
            found.Add(next);
        }

        return found;
    }

    [Pure]
    private static bool PlaysBefore(FoundSong song, FoundSong other) =>
        song.NewStartSeconds < other.NewStartSeconds;

    [Pure]
    private static bool PlaysAfter(FoundSong song, FoundSong other) => PlaysBefore(other, song);
}
