using Furria.Core.Media;

namespace Furria.Application.Media;

public sealed record MediaFileDetails
{
    public required MediaOwner Owner { get; init; }

    public required string FullPath { get; init; }

    public required string ContentType { get; init; }

    public required string DownloadName { get; init; }

    public required DateTimeOffset LastModified { get; init; }
}
