using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class CalendarEntryExpectations
{
    private readonly Expected _expected;
    private readonly int _calendarEntryId;

    internal CalendarEntryExpectations(Expected expected, int calendarEntryId)
    {
        _expected = expected;
        _calendarEntryId = calendarEntryId;
    }

    public Expected ToNotExist() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.False(
                    await dbContext
                        .CalendarEntries.AsNoTracking()
                        .AnyAsync(row => row.Id == _calendarEntryId, ct),
                    $"Expected no CalendarEntry with id {_calendarEntryId}."
                )
        );

    public Expected ToHaveTitle(string title) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(title, (await SingleAsync(dbContext, ct)).Title)
        );

    public Expected ToHaveKind(CalendarEntryKind kind) =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Equal(kind, (await SingleAsync(dbContext, ct)).Kind)
        );

    public Expected ToHaveAudience(CalendarEntryAudience audience) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(audience, (await SingleAsync(dbContext, ct)).Audience)
        );

    public Expected ToBeOwnedBy(int? ownerGroupId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(ownerGroupId, (await SingleAsync(dbContext, ct)).OwnerGroupId)
        );

    public Expected ToBeHeldAt(int? venueId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(venueId, (await SingleAsync(dbContext, ct)).VenueId)
        );

    public Expected ToAskForResponse(bool asksForResponse) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(asksForResponse, (await SingleAsync(dbContext, ct)).AsksForResponse)
        );

    public Expected ToCarryAddOns(params CalendarEntryAddOnKind[] addOns) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var entry = await SingleAsync(dbContext, ct);
                Assert.Equal(
                    addOns,
                    CalendarEntryAddOns.InCardOrder(
                        entry.AttendancePosition,
                        entry.ParticipatingGroupsPosition
                    )
                );
            }
        );

    public Expected ToHavePollsAt(params (int Position, string Question, string Options)[] polls) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    polls,
                    (
                        await dbContext
                            .Polls.AsNoTracking()
                            .Where(poll => poll.CalendarEntryId == _calendarEntryId)
                            .OrderBy(poll => poll.Position)
                            .Select(poll => new
                            {
                                poll.Position,
                                poll.Question,
                                Options = poll
                                    .Options.OrderBy(option => option.Position)
                                    .Select(option => option.Label)
                                    .ToList(),
                            })
                            .ToListAsync(ct)
                    ).Select(poll =>
                        (poll.Position, poll.Question, string.Join(", ", poll.Options))
                    )
                )
        );

    public Expected ToHaveSignUpListsAt(
        params (int Position, string Title, string? Hint)[] lists
    ) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    lists,
                    (
                        await dbContext
                            .SignUpLists.AsNoTracking()
                            .Where(list => list.CalendarEntryId == _calendarEntryId)
                            .OrderBy(list => list.Position)
                            .Select(list => new
                            {
                                list.Position,
                                list.Title,
                                list.Hint,
                            })
                            .ToListAsync(ct)
                    ).Select(list => (list.Position, list.Title, list.Hint))
                )
        );

    public Expected ToHaveDaySchedulesAt(params (int Position, string? Title)[] schedules) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    schedules,
                    (
                        await dbContext
                            .CalendarDaySchedules.AsNoTracking()
                            .Where(schedule => schedule.CalendarEntryId == _calendarEntryId)
                            .OrderBy(schedule => schedule.Position)
                            .Select(schedule => new { schedule.Position, schedule.Title })
                            .ToListAsync(ct)
                    ).Select(schedule => (schedule.Position, schedule.Title))
                )
        );

    public Expected ToHaveDayScheduleSteps(
        params (int Position, int Day, TimeOnly Time, string Text)[] steps
    ) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    steps,
                    (
                        await dbContext
                            .CalendarDayScheduleSteps.AsNoTracking()
                            .Where(step => step.DaySchedule!.CalendarEntryId == _calendarEntryId)
                            .OrderBy(step => step.DaySchedule!.Position)
                            .ThenBy(step => step.Day)
                            .ThenBy(step => step.Time)
                            .Select(step => new
                            {
                                step.DaySchedule!.Position,
                                step.Day,
                                step.Time,
                                step.Text,
                            })
                            .ToListAsync(ct)
                    ).Select(step => (step.Position, step.Day, step.Time, step.Text))
                )
        );

    public Expected ToHavePeriod(DateTimeOffset startsAt, DateTimeOffset? endsAt) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var entry = await SingleAsync(dbContext, ct);
                Assert.Equal(startsAt, entry.StartsAt);
                Assert.Equal(endsAt, entry.EndsAt);
            }
        );

    public Expected ToHaveOwnerGroup(int groupId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(groupId, (await SingleAsync(dbContext, ct)).OwnerGroupId)
        );

    public Expected ToBeClubOwned() =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Null((await SingleAsync(dbContext, ct)).OwnerGroupId)
        );

    public Expected ToHaveVenue(int venueId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(venueId, (await SingleAsync(dbContext, ct)).VenueId)
        );

    public Expected ToCarryParticipatingGroups(params int[] groupIds) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal([.. groupIds.Order()], await ParticipatingGroupIdsAsync(dbContext, ct))
        );

    public Expected ToCarryNoParticipatingGroup() =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Empty(await ParticipatingGroupIdsAsync(dbContext, ct))
        );

    public Expected ToCarryAudienceGroups(params int[] groupIds) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    [.. groupIds.Order()],
                    await dbContext
                        .CalendarEntryAudienceGroups.AsNoTracking()
                        .Where(link => link.CalendarEntryId == _calendarEntryId)
                        .Select(link => link.GroupId)
                        .OrderBy(groupId => groupId)
                        .ToListAsync(ct)
                )
        );

    public Expected ToChoosePeople(params int[] personIds) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    [.. personIds.Order()],
                    await dbContext
                        .CalendarEntryAudiencePeople.AsNoTracking()
                        .Where(link => link.CalendarEntryId == _calendarEntryId)
                        .Select(link => link.PersonId)
                        .OrderBy(personId => personId)
                        .ToListAsync(ct)
                )
        );

    private async Task<IReadOnlyList<int>> ParticipatingGroupIdsAsync(
        AppDbContext dbContext,
        CancellationToken ct
    ) =>
        await dbContext
            .CalendarEntryGroups.AsNoTracking()
            .Where(link => link.CalendarEntryId == _calendarEntryId)
            .Select(link => link.GroupId)
            .OrderBy(groupId => groupId)
            .ToListAsync(ct);

    private Task<CalendarEntry> SingleAsync(AppDbContext dbContext, CancellationToken ct) =>
        dbContext.CalendarEntries.AsNoTracking().SingleAsync(row => row.Id == _calendarEntryId, ct);
}
