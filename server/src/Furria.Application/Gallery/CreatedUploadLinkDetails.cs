namespace Furria.Application.Gallery;

public sealed record CreatedUploadLinkDetails
{
    public required int UploadLinkId { get; init; }

    public required string Token { get; init; }

    public required DateTimeOffset ExpiresAt { get; init; }
}
