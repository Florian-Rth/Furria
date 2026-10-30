namespace Furria.Core.Studio;

public readonly record struct VideoSpan(int VideoId, double StartSeconds, double EndSeconds)
{
    public double LengthSeconds => EndSeconds - StartSeconds;
}
