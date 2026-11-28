namespace Furria.Infrastructure.Studio;

public sealed record ActGlanceViewer(
    int PersonId,
    IReadOnlyList<int> LedGroupIds,
    DateOnly Today,
    int SessionYear
);
