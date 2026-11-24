using Furria.Application.Authorization;
using Furria.Core.Club;

namespace Furria.Infrastructure.Assistant;

public sealed record ClubAssistantAsker(
    int PersonId,
    string FirstName,
    IReadOnlyList<string> GroupNames,
    IReadOnlySet<string> GrantedKeys
)
{
    public CalendarRights CalendarRights =>
        new(
            HoldsClubRead: GrantedKeys.Contains(FurriaPermissions.ClubRead),
            ManagesClubCalendar: GrantedKeys.Contains(FurriaPermissions.CalendarManageClub)
        );
}
