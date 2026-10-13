namespace Furria.Application.Operations;

public sealed record StorageVolumeDetails
{
    public required long FreeBytes { get; init; }

    public required long TotalBytes { get; init; }
}
