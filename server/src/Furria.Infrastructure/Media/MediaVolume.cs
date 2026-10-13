using Furria.Application.Operations;

namespace Furria.Infrastructure.Media;

public static class MediaVolume
{
    public static StorageVolumeDetails? Of(MediaRoot root)
    {
        try
        {
            var drive = new DriveInfo(NearestExistingDirectory(root.FullPathOf("")));
            return new StorageVolumeDetails
            {
                FreeBytes = drive.AvailableFreeSpace,
                TotalBytes = drive.TotalSize,
            };
        }
        catch (Exception exception)
            when (exception
                    is IOException
                        or UnauthorizedAccessException
                        or ArgumentException
                        or PlatformNotSupportedException
            )
        {
            return null;
        }
    }

    private static string NearestExistingDirectory(string path)
    {
        var directory = new DirectoryInfo(path);
        while (directory is { Exists: false, Parent: { } parent })
            directory = parent;
        return directory.FullName;
    }
}
