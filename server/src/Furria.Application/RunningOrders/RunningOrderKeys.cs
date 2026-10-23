using Furria.Application.Authorization;

namespace Furria.Application.RunningOrders;

public static class RunningOrderKeys
{
    public static readonly string[] Planners =
    [
        FurriaPermissions.EventsRunningOrder,
        FurriaPermissions.EventsManage,
    ];
}
