using Furria.Core.Website;

namespace Furria.Application.Website;

public sealed record TransferWebsitePictureCommand
{
    public required PictureSlotPosition From { get; init; }

    public required PictureSlotPosition To { get; init; }

    public required int? TransferredByPersonId { get; init; }
}
