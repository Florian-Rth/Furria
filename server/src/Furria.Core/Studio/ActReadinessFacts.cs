namespace Furria.Core.Studio;

public sealed record ActReadinessFacts(
    int SongCount,
    bool HasAdoptedFinalFile,
    int StepCount,
    int SpotCount,
    int HeldSpotCount,
    int PlacedSpotCount,
    int VideoCount,
    int CastCount
);
