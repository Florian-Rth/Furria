using Furria.Application.Authorization;

namespace Furria.Application.Gallery;

public static class GalleryKeys
{
    public static readonly string[] Viewers =
    [
        FurriaPermissions.ClubRead,
        FurriaPermissions.GalleryUpload,
        FurriaPermissions.GalleryManage,
        FurriaPermissions.GalleryPublish,
    ];

    public static readonly string[] Sorters =
    [
        FurriaPermissions.GalleryUpload,
        FurriaPermissions.GalleryManage,
    ];
}
