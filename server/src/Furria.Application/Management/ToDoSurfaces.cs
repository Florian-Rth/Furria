using System.Collections.Frozen;

namespace Furria.Application.Management;

public static class ToDoSurfaces
{
    public static readonly IReadOnlySet<ToDoKind> EventsWorkbench = new[]
    {
        ToDoKind.TicketRequestWaiting,
    }.ToFrozenSet();
}
