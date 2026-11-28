namespace Furria.Core.Studio;

public readonly record struct StepBorders(
    int StepId,
    MusicAnchor Start,
    MusicAnchor End,
    bool StartNeedsCheck,
    bool EndNeedsCheck
)
{
    public StepAnchors Anchors => new(StepId, Start, End);
}
