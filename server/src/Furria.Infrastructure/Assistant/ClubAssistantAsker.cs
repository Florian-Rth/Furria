using Furria.Application.Authorization;
using Furria.Application.BeerList;
using Furria.Application.Halls;
using Furria.Application.Management;
using Furria.Application.RunningOrders;
using Furria.Core.Club;

namespace Furria.Infrastructure.Assistant;

public sealed record ClubAssistantAsker(
    int PersonId,
    string FirstName,
    IReadOnlyList<string> GroupNames,
    IReadOnlySet<string> GrantedKeys,
    IReadOnlyList<int> AdministeredGroupIds
)
{
    public CalendarRights CalendarRights =>
        new(
            HoldsClubRead: GrantedKeys.Contains(FurriaPermissions.ClubRead),
            ManagesClubCalendar: GrantedKeys.Contains(FurriaPermissions.CalendarManageClub)
        );

    public bool TakesFromBeerList => BeerListKeys.Readers.Any(GrantedKeys.Contains);

    public bool PreparesEvents => GrantedKeys.Contains(FurriaPermissions.EventsManage);

    public bool PlansRunningOrders => RunningOrderKeys.Planners.Any(GrantedKeys.Contains);

    public bool PlansHalls => HallKeys.Planners.Any(GrantedKeys.Contains);

    public bool MayHaveToDos =>
        AdministeredGroupIds.Count > 0 || ToDoKeys.GrantsAnyByPermission(GrantedKeys);

    public ToDoViewer ToDoViewer => new(GrantedKeys, AdministeredGroupIds);
}
