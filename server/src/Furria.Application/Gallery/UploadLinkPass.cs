using System.Diagnostics.Contracts;
using Furria.Core.Gallery;

namespace Furria.Application.Gallery;

public sealed record UploadLinkPass
{
    public required int UploadLinkId { get; init; }

    public required UploadLinkState State { get; init; }

    public required long UploadedBytes { get; init; }

    [Pure]
    public bool HasRoomFor(long byteSize) => UploadedBytes + byteSize <= UploadLink.MaxBytes;
}
