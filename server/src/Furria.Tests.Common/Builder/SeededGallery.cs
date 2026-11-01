namespace Furria.Tests.Common.Builder;

public sealed record SeededGallery(
    IReadOnlyDictionary<string, int> AlbumIds,
    IReadOnlyDictionary<string, int> ItemIds,
    IReadOnlyDictionary<string, int> UploadLinkIds,
    IReadOnlyDictionary<string, string> UploadLinkTokens
);
