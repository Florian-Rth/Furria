using Furria.Application.Start;
using Furria.Infrastructure.Public;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Start;

public sealed partial class StartService
{
    private const int FreshNewsDays = 14;

    private async Task<IReadOnlyList<StartNewsSummary>> FreshNewsAsync(
        Viewer viewer,
        CancellationToken ct
    )
    {
        var since = viewer.Moment.Now.AddDays(-FreshNewsDays);
        var personId = viewer.PersonId;
        var newest = await _publicFace
            .NewsPosts.Where(post => post.PublishedAt >= since && post.AuthorPersonId != personId)
            .OrderByDescending(post => post.PublishedAt)
            .ThenByDescending(post => post.Id)
            .Select(post => new
            {
                Slug = post.Slug!,
                post.Title,
                Category = post.Category!.Value,
                PublishedAt = post.PublishedAt!.Value,
                post.PictureId,
                PictureRenderedAt = post.Picture == null ? null : post.Picture.RenderedAt,
            })
            .FirstOrDefaultAsync(ct);

        return newest is null
            ? []
            :
            [
                new StartNewsSummary
                {
                    Slug = newest.Slug,
                    Title = newest.Title,
                    Category = newest.Category,
                    PublishedAt = newest.PublishedAt,
                    Picture = PublicPictures.Of(
                        PublicPictureKind.NewsPicture,
                        newest.PictureId,
                        newest.PictureRenderedAt
                    ),
                },
            ];
    }
}
