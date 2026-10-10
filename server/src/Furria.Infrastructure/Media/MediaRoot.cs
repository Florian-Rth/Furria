using Furria.Application.Media;
using Furria.Core.Media;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.Media;

public sealed class MediaRoot
{
    private readonly string _fullPath;

    public string StagingPath => FullPathOf(MediaPaths.StagingDirectory);

    public MediaRoot(IOptions<MediaOptions> options)
    {
        _fullPath = Path.GetFullPath(options.Value.RootPath);
    }

    public string FullPathOf(string relativePath) => Path.Combine(_fullPath, relativePath);

    public void PrepareStaging() => Directory.CreateDirectory(StagingPath);

    public void DeleteFilesOf(Guid storageKey)
    {
        var original = FullPathOf(MediaPaths.OriginalOf(storageKey));
        if (File.Exists(original))
            File.Delete(original);

        var renditions = FullPathOf(MediaPaths.RenditionsOf(storageKey));
        if (Directory.Exists(renditions))
            Directory.Delete(renditions, recursive: true);
    }

    public void CopyInto(string sourceRelativePath, string relativePath)
    {
        var destination = FullPathOf(relativePath);
        Directory.CreateDirectory(Path.GetDirectoryName(destination)!);
        File.Copy(FullPathOf(sourceRelativePath), destination);
    }

    public void MoveInto(string sourcePath, string relativePath)
    {
        var destination = FullPathOf(relativePath);
        Directory.CreateDirectory(Path.GetDirectoryName(destination)!);
        File.Move(sourcePath, destination);
    }
}
