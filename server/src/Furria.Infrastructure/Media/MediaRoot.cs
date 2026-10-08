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

    public void MoveInto(string sourcePath, string relativePath)
    {
        var destination = FullPathOf(relativePath);
        Directory.CreateDirectory(Path.GetDirectoryName(destination)!);
        File.Move(sourcePath, destination);
    }
}
