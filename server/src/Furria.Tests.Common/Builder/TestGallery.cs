namespace Furria.Tests.Common.Builder;

public sealed class TestGallery
{
    public AliasRegistry<int> Albums { get; }

    public AliasRegistry<int> Items { get; }

    public AliasRegistry<int> UploadLinks { get; }

    public AliasRegistry<string> UploadLinkTokens { get; }

    internal TestGallery(SeededGallery seeded)
    {
        Albums = new AliasRegistry<int>("Album", seeded.AlbumIds);
        Items = new AliasRegistry<int>("GalleryItem", seeded.ItemIds);
        UploadLinks = new AliasRegistry<int>("UploadLink", seeded.UploadLinkIds);
        UploadLinkTokens = new AliasRegistry<string>("UploadLinkToken", seeded.UploadLinkTokens);
    }
}
