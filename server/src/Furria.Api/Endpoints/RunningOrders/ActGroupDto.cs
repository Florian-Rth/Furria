using System.Diagnostics.Contracts;
using Furria.Api.Media;
using Furria.Application.RunningOrders;
using Furria.Core.Club;
using Furria.Core.Groups;

namespace Furria.Api.Endpoints.RunningOrders;

public sealed record ActGroupDto
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required GroupTone? Tone { get; init; }

    public required ClubIcon? Icon { get; init; }

    public required PictureDto? Picture { get; init; }

    [Pure]
    public static ActGroupDto? From(ActGroupReference? group) =>
        group is null
            ? null
            : new ActGroupDto
            {
                GroupId = group.GroupId,
                Name = group.Name,
                Tone = group.Tone,
                Icon = group.Icon,
                Picture = PictureDto.From(group.Picture),
            };
}
