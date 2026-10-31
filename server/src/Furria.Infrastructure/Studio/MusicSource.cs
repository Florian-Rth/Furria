using Furria.Core.Studio;

namespace Furria.Infrastructure.Studio;

public sealed record MusicSource(MusicCut Cut, Guid StorageKey)
{
    public int SourceMediaItemId => Cut.SourceMediaItemId;
}
