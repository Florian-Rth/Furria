using System.Diagnostics.Contracts;
using Furria.Core.Sound;

namespace Furria.Core.Studio;

public static class VideoMatching
{
    public const double LeastConfidence = 0.35;

    [Pure]
    public static SoundAlignment? StartOf(IReadOnlyList<CutSound> music, SoundProfile soundtrack)
    {
        var mix = SoundProfile.Joined([
            .. music.Select(sound =>
                sound.Profile.Excerpt(sound.Cut.StartSeconds, sound.Cut.EndSeconds)
            ),
        ]);
        if (mix is null)
            return null;

        var alignment = SoundComparison.Align(mix, soundtrack);
        return alignment is { Confidence: >= LeastConfidence } ? alignment : null;
    }
}
