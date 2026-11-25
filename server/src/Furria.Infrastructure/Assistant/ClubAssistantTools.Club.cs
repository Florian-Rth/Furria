using Furria.Application.Club;
using Microsoft.Extensions.AI;

namespace Furria.Infrastructure.Assistant;

public sealed partial class ClubAssistantTools
{
    private IEnumerable<AIFunction> ClubToolsFor(ClubAssistantAsker asker) =>
        [
            AIFunctionFactory.Create(
                (CancellationToken ct) => GroupsAsync(asker, ct),
                Groups,
                "Mitgliederzahl des Vereins und alle Gruppen mit Art, Beschreibung, "
                    + "Gründungsjahr, ob sie Leute suchen, Mitgliederzahl und ob die fragende "
                    + "Person dazugehört. Keine Namen."
            ),
            AIFunctionFactory.Create(
                (CancellationToken ct) => AnnouncementsAsync(asker, ct),
                Announcements,
                "Aktuelle Aushänge am Schwarzen Brett: announcementId, Titel, Text, veröffentlicht, "
                    + "gültig bis, angehängte Funktionen (addOns), Link."
            ),
            AIFunctionFactory.Create(
                NewsAsync,
                News,
                $"Die {ClubAssistantClubFacts.NewestNewsCount} neuesten Vereinsnachrichten: "
                    + "Titel, Teaser, Rubrik, veröffentlicht, Link."
            ),
        ];

    private async Task<GroupOverviewFact> GroupsAsync(
        ClubAssistantAsker asker,
        CancellationToken ct
    ) =>
        ClubAssistantClubFacts.GroupsOf(
            (await _clubService.GetPublicAsync(ct)).MemberCount,
            await _groupService.GetGroupsAsync(asker.PersonId, ct)
        );

    private async Task<IReadOnlyList<AnnouncementFact>> AnnouncementsAsync(
        ClubAssistantAsker asker,
        CancellationToken ct
    ) =>
        [
            .. (await CurrentAnnouncementsAsync(asker, ct)).Select(announcement =>
                ClubAssistantClubFacts.AnnouncementOf(announcement, AppUrl)
            ),
        ];

    private Task<IReadOnlyList<AnnouncementSummary>> CurrentAnnouncementsAsync(
        ClubAssistantAsker asker,
        CancellationToken ct
    ) => _announcementService.GetCurrentAnnouncementsSeenByAsync(SightOf(asker), ct);

    private static AnnouncementSightQuery SightOf(ClubAssistantAsker asker) =>
        new() { PersonId = asker.PersonId, Rights = asker.CalendarRights };

    private async Task<IReadOnlyList<NewsFact>> NewsAsync(CancellationToken ct) =>
        ClubAssistantClubFacts.NewestNewsOf(await _newsService.GetPublicNewsAsync(ct), AppUrl);
}
