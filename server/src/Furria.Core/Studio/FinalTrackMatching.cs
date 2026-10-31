using System.Diagnostics.Contracts;
using Furria.Core.Sound;

namespace Furria.Core.Studio;

public static class FinalTrackMatching
{
    public const double LeastConfidence = 0.35;
    public const double MostTempoChange = 0.05;

    [Pure]
    public static StretchedAlignment? AlignmentOf(CutSound source, SoundProfile finalTrack)
    {
        var heard = source.Profile.Excerpt(source.Cut.StartSeconds, source.Cut.EndSeconds);
        var alignment = SoundComparison.AlignStretched(finalTrack, heard, MostTempoChange);

        return alignment is { Confidence: >= LeastConfidence }
            ? alignment with
            {
                OffsetSeconds =
                    alignment.OffsetSeconds - source.Cut.StartSeconds * alignment.Stretch,
            }
            : null;
    }
}
