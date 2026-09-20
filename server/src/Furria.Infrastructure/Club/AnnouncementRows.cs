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
            announcement.AuthorPersonId,
            announcement.Author!.FirstName,
            announcement.Author!.LastName,
            announcement.Author!.PortraitUrl
        );
}

internal sealed record AnnouncementRow(
    int AnnouncementId,
    string Title,
    string Body,
    DateTimeOffset PublishedAt,
    DateOnly? ValidUntil,
    int AuthorPersonId,
    string FirstName,
    string LastName,
    string? PortraitUrl
);
