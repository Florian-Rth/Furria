using System.Collections.Frozen;
using System.Diagnostics.Contracts;
using Furria.Application.Results;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Furria.Infrastructure.Persistence;

public static class AppDbContextExtensions
{
    private static readonly FrozenDictionary<string, string> ConflictMessagesByIndex =
        new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["ix_membership_person_id_open"] = WriteConflictMessages.OpenMitgliedschaft,
            ["ix_group_membership_group_id_person_id_open"] =
                WriteConflictMessages.OpenZugehoerigkeit,
            ["ix_group_admin_group_id_person_id_open"] = WriteConflictMessages.OpenErnennung,
            ["ix_role_holding_role_id_person_id_open"] = WriteConflictMessages.OpenInhaberschaft,
            ["ix_group_name_active"] = WriteConflictMessages.DuplicateGruppenName,
            ["ix_role_name_active"] = WriteConflictMessages.DuplicateRollenName,
            ["ix_venue_name"] = WriteConflictMessages.DuplicateOrt,
            ["ix_board_office_name"] = WriteConflictMessages.DuplicateVorstandsfunktion,
        }.ToFrozenDictionary(StringComparer.Ordinal);

    public static async Task<Result> SaveOrConflictAsync(
        this AppDbContext dbContext,
        CancellationToken ct
    )
    {
        try
        {
            await dbContext.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (DbUpdateException exception) when (ConflictMessageOf(exception) is { } message)
        {
            return Result.Conflict(message);
        }
    }

    [Pure]
    private static string? ConflictMessageOf(DbUpdateException exception) =>
        exception.InnerException is PostgresException violation
        && violation.SqlState == PostgresErrorCodes.UniqueViolation
        && violation.ConstraintName is { } index
        && ConflictMessagesByIndex.TryGetValue(index, out var message)
            ? message
            : null;
}
