using Furria.Application.Authorization;

namespace Furria.Application.Halls;

public static class HallKeys
{
    public static readonly string[] Planners =
    [
        FurriaPermissions.EventsHall,
        FurriaPermissions.EventsManage,
    ];
}
