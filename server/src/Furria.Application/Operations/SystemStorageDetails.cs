namespace Furria.Application.Operations;

public sealed record SystemStorageDetails
{
    public required StorageVolumeDetails? Volume { get; init; }

    public required StorageSurveyDetails? Survey { get; init; }
}
