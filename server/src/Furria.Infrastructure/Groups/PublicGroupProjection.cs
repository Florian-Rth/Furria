using System.Linq.Expressions;
using Furria.Application.Groups;
using Furria.Core.Groups;
using Furria.Infrastructure.Persistence;
using Furria.Infrastructure.Public;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Groups;

internal static class PublicGroupProjection
{
    internal static readonly Expression<Func<Group, PublicGroupSummary>> Summary =
        group => new PublicGroupSummary
        {
            GroupId = group.Id,
            Name = group.Name,
            Description = group.Description,
            IsRecruiting = group.IsRecruiting,
            GroupKindName = group.GroupKind!.Name,
            FoundedYear = group.FoundedYear,
            Tone = group.Tone,
            Picture = PublicPictures.Of(
                PublicPictureKind.GroupPicture,
                group.PictureId,
                group.Picture == null ? null : group.Picture.RenderedAt
            ),
        };

    internal static IQueryable<PublicGroupSummary> InNameOrder(IQueryable<Group> groups) =>
        groups
            .OrderBy(group => EF.Functions.Collate(group.Name, GermanCollation.Name))
            .ThenBy(group => group.Id)
            .Select(Summary);
}
