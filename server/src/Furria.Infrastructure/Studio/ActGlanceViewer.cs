namespace Furria.Infrastructure.Studio;

public sealed record ActGlanceViewer(
    int PersonId,
    IReadOnlyList<int> LedGroupIds,
    IReadOnlyList<int> CoEditedActIds,
    DateOnly Today,
    int SessionYear
);
