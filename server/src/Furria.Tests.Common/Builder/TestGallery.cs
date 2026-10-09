namespace Furria.Tests.Common.Builder;

public sealed class TestGallery
{
    public AliasRegistry<int> Albums { get; }

    public AliasRegistry<int> Items { get; }

    internal TestGallery(SeededGallery seeded)
    {
        Albums = new AliasRegistry<int>("Album", seeded.AlbumIds);
        Items = new AliasRegistry<int>("GalleryItem", seeded.ItemIds);
    }
}
