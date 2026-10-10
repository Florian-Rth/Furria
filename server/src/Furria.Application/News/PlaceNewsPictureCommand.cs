namespace Furria.Application.News;

public sealed record PlaceNewsPictureCommand
{
    public required int NewsPostId { get; init; }

    public required int MediaItemId { get; init; }

    public required int? PlacedByPersonId { get; init; }
}
