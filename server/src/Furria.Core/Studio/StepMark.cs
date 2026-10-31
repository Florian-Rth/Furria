namespace Furria.Core.Studio;

public sealed record StepMark(IReadOnlyList<MusicAnchor> NewStarts, StepMarkRefusal? Refusal)
{
    public static StepMark Refused(StepMarkRefusal refusal) => new([], refusal);

    public static StepMark Starting(params MusicAnchor[] starts) => new(starts, null);
}
