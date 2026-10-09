using Furria.Core.Media;

namespace Furria.Application.Media;

public sealed record AdoptUploadCommand
{
    public required string StagedFilePath { get; init; }

    public required MediaFormat Format { get; init; }

    public required MediaOwner Owner { get; init; }

    public required string OriginalFileName { get; init; }

    public required long ByteSize { get; init; }

    public required int? UploadedByPersonId { get; init; }

    public int? AlbumId { get; init; }
    public PictureCrop? Crop { get; init; }
}
