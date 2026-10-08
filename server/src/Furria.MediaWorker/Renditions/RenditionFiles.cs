using Furria.Core.Media;
using Furria.Infrastructure.Media;

namespace Furria.MediaWorker.Renditions;

public sealed class RenditionFiles : IDisposable
{
    private readonly MediaRoot _root;
    private readonly Guid _storageKey;
    private readonly List<string> _scratchFiles = [];

    public string OriginalPath => _root.FullPathOf(MediaPaths.OriginalOf(_storageKey));

    public RenditionFiles(MediaRoot root, Guid storageKey)
    {
        _root = root;
        _storageKey = storageKey;
    }

    public string ScratchFileFor(MediaRendition rendition, string extension)
    {
        var target = TargetOf(rendition);
        Directory.CreateDirectory(Path.GetDirectoryName(target)!);
        var scratch = Path.Combine(
            Path.GetDirectoryName(target)!,
            $".{Path.GetFileNameWithoutExtension(target)}.{Guid.NewGuid():N}{extension}"
        );
        _scratchFiles.Add(scratch);
        return scratch;
    }

    public void Publish(string scratchFile, MediaRendition rendition) =>
        File.Move(scratchFile, TargetOf(rendition), overwrite: true);

    public void DeleteAll()
    {
        var renditions = _root.FullPathOf(MediaPaths.RenditionsOf(_storageKey));
        if (Directory.Exists(renditions))
            Directory.Delete(renditions, recursive: true);
    }

    public void Dispose()
    {
        foreach (var scratch in _scratchFiles.Where(File.Exists))
            File.Delete(scratch);
    }

    private string TargetOf(MediaRendition rendition) =>
        _root.FullPathOf(MediaPaths.RenditionOf(_storageKey, rendition));
}
