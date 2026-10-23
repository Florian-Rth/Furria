using Furria.Application.Media;
using Furria.Core.Club;
using Furria.Core.Groups;

namespace Furria.Application.RunningOrders;

public sealed record ActGroupReference
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required GroupTone? Tone { get; init; }

    public required ClubIcon? Icon { get; init; }

    public required PictureDetails? Picture { get; init; }
}
