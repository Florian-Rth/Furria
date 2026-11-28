namespace Furria.Core.Studio;

public sealed record StepCreation(
    MusicAnchor? Start,
    MusicAnchor? End,
    StepSplit? Split,
    StepRefusal? Refusal
)
{
    public static StepCreation Refused(StepRefusal refusal) => new(null, null, null, refusal);

    public static StepCreation Fresh(MusicAnchor start, MusicAnchor end) =>
        new(start, end, null, null);

    public static StepCreation Splitting(StepSplit split, MusicAnchor start) =>
        new(start, null, split, null);
}
