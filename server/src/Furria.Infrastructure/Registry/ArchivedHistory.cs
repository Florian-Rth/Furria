using System.Diagnostics.Contracts;
using Furria.Core.Identity;

namespace Furria.Infrastructure.Registry;

public static class ArchivedHistory
{
    [Pure]
    public static bool IsClosed(Person person) => person.ArchivedOn is not null;

    [Pure]
    public static string RefusalFor(Person person, string records) =>
        $"{person.FirstName} ist archiviert – {records} lassen sich erst nach dem "
        + "Wiederherstellen festhalten.";
}
