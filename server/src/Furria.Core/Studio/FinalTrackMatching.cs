using System.Diagnostics.Contracts;
using Furria.Core.Sound;

namespace Furria.Core.Studio;

public static class FinalTrackMatching
{
    public const double LeastConfidence = 0.35;

    [Pure]
    public static SoundAlignment? OffsetOf(CutSound source, SoundProfile finalTrack)
    {
        var heard = source.Profile.Excerpt(source.Cut.StartSeconds, source.Cut.EndSeconds);
        var alignment = SoundComparison.Align(finalTrack, heard);

        return alignment is { Confidence: >= LeastConfidence }
            ? alignment with
            {
                OffsetSeconds = alignment.OffsetSeconds - source.Cut.StartSeconds,
            }
            : null;
    }
}
