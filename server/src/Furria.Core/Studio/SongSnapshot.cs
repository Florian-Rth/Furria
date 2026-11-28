namespace Furria.Core.Studio;

public sealed record SongSnapshot(
    int SongId,
    int MediaItemId,
    int Position,
    double StartSeconds,
    double? EndSeconds,
    double? FirstBeatSeconds,
    double? TempoBpm
);
