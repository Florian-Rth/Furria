using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

internal sealed record AttendanceRecord(
    int CalendarEntryId,
    int PersonId,
    AttendanceAnswer Answer,
    bool IsRecordedOnBehalf,
    int? RecordedByPersonId
);

internal static class AttendanceRecords
{
    public static async Task<AttendanceResponse?> LockedResponseAsync(
        this AppDbContext dbContext,
        int calendarEntryId,
        int personId,
        CancellationToken ct
    )
    {
        await dbContext.Database.ExecuteSqlAsync(
            $"""
            SELECT 1 FROM attendance_response
            WHERE calendar_entry_id = {calendarEntryId} AND person_id = {personId}
            FOR UPDATE
            """,
            ct
        );

        return await dbContext.AttendanceResponses.SingleOrDefaultAsync(
            response =>
                response.CalendarEntryId == calendarEntryId && response.PersonId == personId,
            ct
        );
    }

    public static void Record(
        this AppDbContext dbContext,
        AttendanceResponse? recorded,
        AttendanceRecord record,
        DateTimeOffset at
    )
    {
        var response = recorded ?? NewResponseOf(dbContext, record);
        response.Answer = record.Answer;
        response.IsRecordedOnBehalf = record.IsRecordedOnBehalf;
        response.RecordedByPersonId = record.RecordedByPersonId;

        dbContext.AttendanceResponseChanges.Add(
            new AttendanceResponseChange
            {
                CalendarEntryId = record.CalendarEntryId,
                PersonId = record.PersonId,
                Answer = record.Answer,
                IsRecordedOnBehalf = record.IsRecordedOnBehalf,
                RecordedByPersonId = record.RecordedByPersonId,
                RecordedAt = at,
            }
        );
    }

    private static AttendanceResponse NewResponseOf(AppDbContext dbContext, AttendanceRecord record)
    {
        var response = new AttendanceResponse
        {
            CalendarEntryId = record.CalendarEntryId,
            PersonId = record.PersonId,
        };
        dbContext.AttendanceResponses.Add(response);

        return response;
    }
}
