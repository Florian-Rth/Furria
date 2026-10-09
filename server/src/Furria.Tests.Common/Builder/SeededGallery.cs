namespace Furria.Tests.Common.Builder;

public sealed record SeededGallery(
    IReadOnlyDictionary<string, int> AlbumIds,
    IReadOnlyDictionary<string, int> ItemIds
);
