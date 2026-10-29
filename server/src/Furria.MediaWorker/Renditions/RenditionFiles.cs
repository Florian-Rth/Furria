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

    public string ScratchFileFor(MediaRendition rendition, string extension) =>
        ScratchFileBeside(TargetOf(rendition), extension);

    public string ScratchFileForSoundProfile() => ScratchFileBeside(SoundProfilePath, ".bin");

    public string ScratchFileForSound() => ScratchFileBeside(SoundProfilePath, ".pcm");

    public void Publish(string scratchFile, MediaRendition rendition) =>
        File.Move(scratchFile, TargetOf(rendition), overwrite: true);

    public void PublishSoundProfile(string scratchFile) =>
        File.Move(scratchFile, SoundProfilePath, overwrite: true);

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

    private string SoundProfilePath => _root.FullPathOf(MediaPaths.SoundProfileOf(_storageKey));

    private string ScratchFileBeside(string target, string extension)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(target)!);
        var scratch = Path.Combine(
            Path.GetDirectoryName(target)!,
            $".{Path.GetFileNameWithoutExtension(target)}.{Guid.NewGuid():N}{extension}"
        );
        _scratchFiles.Add(scratch);
        return scratch;
    }

    private string TargetOf(MediaRendition rendition) =>
        _root.FullPathOf(MediaPaths.RenditionOf(_storageKey, rendition));
}
