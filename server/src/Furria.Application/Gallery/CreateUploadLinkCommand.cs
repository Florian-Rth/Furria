namespace Furria.Application.Gallery;

public sealed record CreateUploadLinkCommand
{
    public required int ActorAccountId { get; init; }

    public required string Title { get; init; }
}
