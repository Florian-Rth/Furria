using System.Diagnostics.Contracts;
using Furria.Api.Endpoints.RunningOrders;
using Furria.Api.Media;
using Furria.Application.RunningOrders;
using Furria.Core.RunningOrders;

namespace Furria.Api.Endpoints.Acts;

public sealed record ActSummaryDto
{
    public required int ActId { get; init; }

    public required string Name { get; init; }

    public required ActKind? Kind { get; init; }

    public required int? SessionYear { get; init; }

    public required bool Closed { get; init; }

    public required ActGroupDto? Group { get; init; }

    public required bool Archived { get; init; }

    public required IReadOnlyList<CastPersonDto> Cast { get; init; }

    public required IReadOnlyList<ActPersonDto> Added { get; init; }

    public required IReadOnlyList<ActPersonDto> Removed { get; init; }

    public required IReadOnlyList<ActWishDto> Wishes { get; init; }

    [Pure]
    public static ActSummaryDto From(ActSummary act) =>
        new()
        {
            ActId = act.ActId,
            Name = act.Name,
            Kind = act.Kind,
            SessionYear = act.SessionYear,
            Closed = act.IsClosed,
            Group = ActGroupDto.From(act.Group),
            Archived = act.IsArchived,
            Cast = [.. act.Cast.Select(CastPersonDto.From)],
            Added = [.. act.Added.Select(ActPersonDto.From)],
            Removed = [.. act.Removed.Select(ActPersonDto.From)],
            Wishes = [.. act.Wishes.Select(ActWishDto.From)],
        };
}

public sealed record ActPersonDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required PictureDto? Portrait { get; init; }

    [Pure]
    public static ActPersonDto From(CastMember member) =>
        new()
        {
            PersonId = member.PersonId,
            FirstName = member.FirstName,
            LastName = member.LastName,
            Portrait = PictureDto.From(member.Portrait),
        };
}
