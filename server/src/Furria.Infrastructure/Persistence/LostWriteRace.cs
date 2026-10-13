using System.Diagnostics.Contracts;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Furria.Infrastructure.Persistence;

public static class LostWriteRace
{
    [Pure]
    public static bool Caused(Exception exception) =>
        exception switch
        {
            DbUpdateConcurrencyException => true,
            DbUpdateException { InnerException: PostgresException violation } => IsRace(violation),
            PostgresException violation => IsRace(violation),
            _ => false,
        };

    [Pure]
    private static bool IsRace(PostgresException violation) =>
        violation.SqlState
            is PostgresErrorCodes.UniqueViolation
                or PostgresErrorCodes.ForeignKeyViolation;
}
