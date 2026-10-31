using Furria.Core.Club;
using Furria.Core.Groups;
using Xunit;

namespace Furria.Api.Tests.Groups;

public sealed class UsualTrainingOccurrencesTests
{
    private const int TuesdayUsualTimeId = 11;
    private const int ThursdayUsualTimeId = 12;
    private const int NinetyMinutes = 90;

    private static readonly TimeOnly HalfPastSeven = new(19, 30);
    private static readonly TimeOnly EighteenThirty = new(18, 30);

    [Fact]
    public void Should_ReturnNothing_When_TheGroupStatesNoUsualTime()
    {
        var expanded = UsualTrainingOccurrences.Between(
            [],
            new DateOnly(2027, 1, 4),
            new DateOnly(2027, 2, 4)
        );

        Assert.Empty(expanded);
    }

    [Fact]
    public void Should_ReturnNothing_When_TheWeekdayNeverFallsInTheWindow()
    {
        var expanded = UsualTrainingOccurrences.Between(
            [Tuesday()],
            new DateOnly(2027, 1, 6),
            new DateOnly(2027, 1, 11)
        );

        Assert.Empty(expanded);
    }

    [Fact]
    public void Should_StartOnTheWindowsFirstDay_When_ItAlreadyIsThatWeekday()
    {
        var expanded = UsualTrainingOccurrences.Between(
            [Tuesday()],
            new DateOnly(2027, 1, 5),
            new DateOnly(2027, 1, 5)
        );

        var single = Assert.Single(expanded);
        Assert.Equal(
            new DateTimeOffset(2027, 1, 5, 19, 30, 0, TimeSpan.FromHours(1)),
            single.StartsAt
        );
    }

    [Fact]
    public void Should_ReturnOneDatePerWeek_When_OneUsualTimeSpansFourWeeks()
    {
        var expanded = UsualTrainingOccurrences.Between(
            [Tuesday()],
            new DateOnly(2027, 1, 4),
            new DateOnly(2027, 2, 1)
        );

        Assert.Equal(
            [
                new DateOnly(2027, 1, 5),
                new DateOnly(2027, 1, 12),
                new DateOnly(2027, 1, 19),
                new DateOnly(2027, 1, 26),
            ],
            expanded.Select(occurrence => ClubClock.DayOf(occurrence.StartsAt))
        );
    }

    [Fact]
    public void Should_OrderByInstant_When_TheGroupTrainsTwiceAWeek()
    {
        var expanded = UsualTrainingOccurrences.Between(
            [Thursday(), Tuesday()],
            new DateOnly(2027, 1, 4),
            new DateOnly(2027, 1, 15)
        );

        Assert.Equal(
            [TuesdayUsualTimeId, ThursdayUsualTimeId, TuesdayUsualTimeId, ThursdayUsualTimeId],
            expanded.Select(occurrence => occurrence.UsualTrainingTimeId)
        );
    }

    [Fact]
    public void Should_EndTheOccurrence_When_TheDurationHasPassed()
    {
        var expanded = UsualTrainingOccurrences.Between(
            [Tuesday()],
            new DateOnly(2027, 1, 5),
            new DateOnly(2027, 1, 5)
        );

        var single = Assert.Single(expanded);
        Assert.Equal(
            new DateTimeOffset(2027, 1, 5, 21, 0, 0, TimeSpan.FromHours(1)),
            single.EndsAt
        );
    }

    [Fact]
    public void Should_KeepTheWallClock_When_TheWindowCrossesTheSpringDstBoundary()
    {
        var expanded = UsualTrainingOccurrences.Between(
            [Tuesday()],
            new DateOnly(2027, 3, 23),
            new DateOnly(2027, 3, 31)
        );

        Assert.Equal(
            [
                new DateTimeOffset(2027, 3, 23, 19, 30, 0, TimeSpan.FromHours(1)),
                new DateTimeOffset(2027, 3, 30, 19, 30, 0, TimeSpan.FromHours(2)),
            ],
            expanded.Select(occurrence => occurrence.StartsAt)
        );
    }

    [Fact]
    public void Should_KeepTheWallClock_When_TheWindowCrossesTheAutumnDstBoundary()
    {
        var expanded = UsualTrainingOccurrences.Between(
            [Tuesday()],
            new DateOnly(2027, 10, 26),
            new DateOnly(2027, 11, 2)
        );

        Assert.Equal(
            [
                new DateTimeOffset(2027, 10, 26, 19, 30, 0, TimeSpan.FromHours(2)),
                new DateTimeOffset(2027, 11, 2, 19, 30, 0, TimeSpan.FromHours(1)),
            ],
            expanded.Select(occurrence => occurrence.StartsAt)
        );
    }

    [Fact]
    public void Should_CarryTheVenue_When_TheUsualTimeNamesOne()
    {
        var expanded = UsualTrainingOccurrences.Between(
            [Tuesday()],
            new DateOnly(2027, 1, 5),
            new DateOnly(2027, 1, 5)
        );

        var single = Assert.Single(expanded);
        Assert.Equal(7, single.VenueId);
    }

    private static UsualTrainingTime Tuesday() =>
        new()
        {
            Id = TuesdayUsualTimeId,
            GroupId = 1,
            VenueId = 7,
            Weekday = DayOfWeek.Tuesday,
            StartsAt = HalfPastSeven,
            DurationMinutes = NinetyMinutes,
        };

    private static UsualTrainingTime Thursday() =>
        new()
        {
            Id = ThursdayUsualTimeId,
            GroupId = 1,
            VenueId = null,
            Weekday = DayOfWeek.Thursday,
            StartsAt = EighteenThirty,
            DurationMinutes = NinetyMinutes,
        };
}
