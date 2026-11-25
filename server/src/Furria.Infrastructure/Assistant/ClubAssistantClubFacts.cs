using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Application.Groups;
using Furria.Application.News;
using Furria.Core.News;
using Furria.Infrastructure.WhatsApp;

namespace Furria.Infrastructure.Assistant;

public static class ClubAssistantClubFacts
{
    public const int NewestNewsCount = 5;

    [Pure]
    public static GroupOverviewFact GroupsOf(
        int clubMemberCount,
        IReadOnlyList<GroupSummary> groups
    ) =>
        new(
            clubMemberCount,
            [
                .. groups.Select(group => new GroupFact(
                    group.Name,
                    group.GroupKindName,
                    group.Description,
                    group.FoundedYear,
                    group.IsRecruiting,
                    group.MemberCount,
                    group.ViewerIsMember || group.ViewerIsAdmin
                )),
            ]
        );

    [Pure]
    public static AnnouncementFact AnnouncementOf(
        CurrentAnnouncementSummary announcement,
        string appUrl
    ) =>
        new(
            announcement.Title,
            ClubAssistantText.PlainOf(announcement.Body),
            ClubAssistantFacts.MomentOf(announcement.PublishedAt),
            announcement.ValidUntil is { } validUntil ? ClubAssistantFacts.DayOf(validUntil) : null,
            WhatsAppHostLinks.AnnouncementOf(appUrl, announcement.AnnouncementId)
        );

    [Pure]
    public static IReadOnlyList<NewsFact> NewestNewsOf(
        IReadOnlyList<PublicNewsSection> sections,
        string appUrl
    ) =>
        [
            .. sections
                .SelectMany(section => section.Posts)
                .OrderByDescending(post => post.PublishedAt)
                .Take(NewestNewsCount)
                .Select(post => new NewsFact(
                    post.Title,
                    ClubAssistantText.PlainOf(post.Teaser),
                    CategoryOf(post.Category),
                    ClubAssistantFacts.MomentOf(post.PublishedAt),
                    WhatsAppHostLinks.NewsPostOf(appUrl, post.Slug)
                )),
        ];

    [Pure]
    private static string CategoryOf(NewsCategory category) =>
        category switch
        {
            NewsCategory.Session => "Session",
            NewsCategory.Achievements => "Erfolge",
            NewsCategory.Club => "Verein",
            NewsCategory.Groups => "Gruppen",
            _ => throw new ArgumentOutOfRangeException(nameof(category), category, null),
        };
}
