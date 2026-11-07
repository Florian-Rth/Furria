namespace Furria.Core.Studio;

public readonly record struct SourceAlignment(
    int SourceMediaItemId,
    double FromSeconds,
    FinalTrackPlacement Placement
);
