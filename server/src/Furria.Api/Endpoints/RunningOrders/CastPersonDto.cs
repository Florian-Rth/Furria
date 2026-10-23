using System.Diagnostics.Contracts;
using Furria.Api.Media;
using Furria.Application.RunningOrders;

namespace Furria.Api.Endpoints.RunningOrders;

public sealed record CastPersonDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required PictureDto? Portrait { get; init; }

    public required bool Absent { get; init; }

    [Pure]
    public static CastPersonDto From(CastMember member) =>
        new()
        {
            PersonId = member.PersonId,
            FirstName = member.FirstName,
            LastName = member.LastName,
            Portrait = PictureDto.From(member.Portrait),
            Absent = member.IsAbsent,
        };
}
