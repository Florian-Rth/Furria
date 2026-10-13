using System.Diagnostics.Contracts;
using Npgsql;

namespace Furria.Infrastructure.Persistence;

public static class TransientDatabaseFailure
{
    [Pure]
    public static bool Caused(Exception exception) =>
        exception switch
        {
            NpgsqlException { IsTransient: true } => true,
            AggregateException aggregate => aggregate.InnerExceptions.Any(Caused),
            { InnerException: { } inner } => Caused(inner),
            _ => false,
        };
}
