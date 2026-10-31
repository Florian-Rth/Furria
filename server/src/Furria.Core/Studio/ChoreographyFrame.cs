namespace Furria.Core.Studio;

public sealed record ChoreographyFrame(
    IReadOnlySet<int> SpotIds,
    IReadOnlySet<int> MusicSourceIds,
    ActMusic Music,
    StageSize Stage
);
