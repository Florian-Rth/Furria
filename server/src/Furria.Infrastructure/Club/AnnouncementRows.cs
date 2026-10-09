using System.Linq.Expressions;
using Furria.Core.Club;

namespace Furria.Infrastructure.Club;

internal static class AnnouncementRows
{
    internal static readonly Expression<Func<Announcement, AnnouncementRow>> Projection =
        announcement => new AnnouncementRow(
            announcement.Id,
            announcement.Title,
            announcement.Body,
            announcement.PublishedAt,
            announcement.ValidUntil,
            announcement.Author == null
                ? null
                : new AnnouncementAuthorRow(
                    announcement.Author.Id,
                    announcement.Author.FirstName,
                    announcement.Author.LastName,
                    announcement.Author.PortraitId,
                    announcement.Author.Portrait!.RenderedAt
                )
        );
}

internal sealed record AnnouncementRow(
    int AnnouncementId,
    string Title,
    string Body,
    DateTimeOffset PublishedAt,
    DateOnly? ValidUntil,
    AnnouncementAuthorRow? Author
);

internal sealed record AnnouncementAuthorRow(
    int PersonId,
    string FirstName,
    string LastName,
    int? PortraitId,
    DateTimeOffset? PortraitRenderedAt
);
