using Furria.Core.Media;
using Furria.Core.Sound;
using Furria.Core.Studio;
using Furria.Infrastructure.Media;

namespace Furria.Infrastructure.Studio;

public sealed class SoundProfiles
{
    private readonly MediaRoot _root;

    public SoundProfiles(MediaRoot root)
    {
        _root = root;
    }

    public async Task<SoundProfile?> ProfileOfAsync(Guid storageKey, CancellationToken ct)
    {
        var path = _root.FullPathOf(MediaPaths.SoundProfileOf(storageKey));
        return File.Exists(path)
            ? SoundProfile.Parse(await File.ReadAllBytesAsync(path, ct))
            : null;
    }

    public async Task<IReadOnlyList<CutSound>?> CutSoundsOfAsync(
        IReadOnlyList<MusicSource> music,
        CancellationToken ct
    )
    {
        var sounds = new List<CutSound>();
        foreach (var source in music)
        {
            if (await ProfileOfAsync(source.StorageKey, ct) is not { } profile)
                return null;
            sounds.Add(new CutSound(source.Cut, profile));
        }

        return sounds;
    }
}
