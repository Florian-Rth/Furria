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
            ["ix_membership_person_id_open"] = WriteConflictMessages.OpenMembership,
            ["ix_group_membership_group_id_person_id_open"] =
                WriteConflictMessages.OpenGroupMembership,
            ["ix_group_admin_group_id_person_id_open"] = WriteConflictMessages.OpenGroupAdmin,
            ["ix_role_holding_role_id_person_id_open"] = WriteConflictMessages.OpenRoleHolding,
            ["ix_group_name_active"] = WriteConflictMessages.DuplicateGroupName,
            ["ix_role_name_active"] = WriteConflictMessages.DuplicateRoleName,
            ["ix_venue_name"] = WriteConflictMessages.DuplicateVenue,
            ["ix_board_office_name"] = WriteConflictMessages.DuplicateBoardOffice,
            ["ix_attendance_response_calendar_entry_id_person_id"] =
                WriteConflictMessages.DuplicateAttendanceResponse,
            ["ix_group_kind_name_active"] = WriteConflictMessages.DuplicateGroupKind,
            ["ix_calendar_entry_group_calendar_entry_id_group_id"] =
                WriteConflictMessages.DuplicateParticipation,
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
