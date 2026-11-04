using System.Diagnostics.Contracts;

namespace Furria.Core.Studio;

public static class SourceAlignments
{
    [Pure]
    public static SourceAlignment? OfPiece(IEnumerable<SourceAlignment> alignments, MusicCut piece)
    {
        var ofSource = OfSource(alignments, piece.SourceMediaItemId);
        return LatestOf(ofSource.Where(alignment => alignment.FromSeconds < piece.EndSeconds))
            ?? EarliestOf(ofSource);
    }

    [Pure]
    public static SourceAlignment? Near(IEnumerable<SourceAlignment> alignments, MusicAnchor anchor)
    {
        var ofSource = OfSource(alignments, anchor.SourceMediaItemId);
        return LatestOf(ofSource.Where(alignment => alignment.FromSeconds <= anchor.Seconds))
            ?? EarliestOf(ofSource);
    }

    [Pure]
    private static List<SourceAlignment> OfSource(
        IEnumerable<SourceAlignment> alignments,
        int sourceMediaItemId
    ) => [.. alignments.Where(alignment => alignment.SourceMediaItemId == sourceMediaItemId)];

    [Pure]
    private static SourceAlignment? LatestOf(IEnumerable<SourceAlignment> alignments) =>
        alignments
            .Select(alignment => (SourceAlignment?)alignment)
            .MaxBy(alignment => alignment!.Value.FromSeconds);

    [Pure]
    private static SourceAlignment? EarliestOf(IEnumerable<SourceAlignment> alignments) =>
        alignments
            .Select(alignment => (SourceAlignment?)alignment)
            .MinBy(alignment => alignment!.Value.FromSeconds);
}
