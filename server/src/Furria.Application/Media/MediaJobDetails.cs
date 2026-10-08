using Furria.Core.Media;

namespace Furria.Application.Media;

public sealed record MediaJobDetails
{
    public required MediaJobLease Lease { get; init; }

    public required int MediaItemId { get; init; }

    public required Guid StorageKey { get; init; }

    public required MediaKind Kind { get; init; }

    public required MediaCropDetails? Crop { get; init; }

    public required int Attempt { get; init; }
}
