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
                    $"Expected no Kalendereintrag with id {_calendarEntryId}."
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

    public Expected ToHaveVisibility(CalendarEntryVisibility visibility) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(visibility, (await SingleAsync(dbContext, ct)).Visibility)
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

    public Expected ToCarryMitwirkendeGruppen(params int[] groupIds) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal([.. groupIds.Order()], await ParticipatingGroupIdsAsync(dbContext, ct))
        );

    public Expected ToCarryNoMitwirkendeGruppe() =>
        _expected.Enqueue(
            async (dbContext, ct) => Assert.Empty(await ParticipatingGroupIdsAsync(dbContext, ct))
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
