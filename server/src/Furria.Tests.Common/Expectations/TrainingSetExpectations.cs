using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class TrainingSetExpectations
{
    private readonly Expected _expected;
    private readonly int _groupId;

    internal TrainingSetExpectations(Expected expected, int groupId)
    {
        _expected = expected;
        _groupId = groupId;
    }

    public Expected ToHaveCount(int count) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.Equal(
                    count,
                    await dbContext
                        .CalendarEntries.AsNoTracking()
                        .CountAsync(
                            entry =>
                                entry.OwnerGroupId == _groupId
                                && entry.Kind == CalendarEntryKind.Training,
                            ct
                        )
                )
        );

    public Expected ToBeEmpty() => ToHaveCount(0);

    public Expected ToCarryTraining(
        string title,
        DateTimeOffset startsAt,
        DateTimeOffset endsAt,
        int? venueId
    ) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
                Assert.True(
                    await dbContext
                        .CalendarEntries.AsNoTracking()
                        .AnyAsync(
                            entry =>
                                entry.OwnerGroupId == _groupId
                                && entry.Kind == CalendarEntryKind.Training
                                && entry.Visibility == CalendarEntryVisibility.Group
                                && entry.Title == title
                                && entry.StartsAt == startsAt
                                && entry.EndsAt == endsAt
                                && entry.VenueId == venueId,
                            ct
                        ),
                    $"Expected a Training \"{title}\" at {startsAt} for Group {_groupId}."
                )
        );
}
