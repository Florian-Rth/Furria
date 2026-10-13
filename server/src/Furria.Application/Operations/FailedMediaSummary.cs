using Furria.Core.Media;

namespace Furria.Application.Operations;

public sealed record FailedMediaSummary
{
    public required int MediaItemId { get; init; }

    public required MediaOwnerKind OwnerKind { get; init; }

    public required string FileName { get; init; }

    public required string Reason { get; init; }

    public required DateTimeOffset FailedAt { get; init; }
}
