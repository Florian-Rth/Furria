namespace Furria.Core.Studio;

public readonly record struct MusicCut(
    int SourceMediaItemId,
    double StartSeconds,
    double EndSeconds
)
{
    public double LengthSeconds => EndSeconds - StartSeconds;
}
