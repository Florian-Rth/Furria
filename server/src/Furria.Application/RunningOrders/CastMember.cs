using Furria.Application.Media;

namespace Furria.Application.RunningOrders;

public sealed record CastMember
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required PictureDetails? Portrait { get; init; }

    public required bool IsAbsent { get; init; }
}
