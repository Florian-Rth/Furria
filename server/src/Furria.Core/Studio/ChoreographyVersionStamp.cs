namespace Furria.Core.Studio;

public sealed record ChoreographyVersionStamp(
    int Version,
    ChoreographyVersionKind Kind,
    DateTimeOffset SavedAt
);
