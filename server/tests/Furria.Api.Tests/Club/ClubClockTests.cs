using Furria.Core.Club;
using Microsoft.Extensions.Time.Testing;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class ClubClockTests
{
    [Fact]
    public void Should_ReadTheGermanDay_When_UtcIsStillOnThePreviousDayInWinter()
    {
        var clock = At(2025, 11, 10, 23, 30);

        Assert.Equal(new DateOnly(2025, 11, 11), ClubClock.Today(clock));
    }

    [Fact]
    public void Should_ReadTheGermanDay_When_UtcIsStillOnThePreviousDayInSummer()
    {
        var clock = At(2026, 6, 30, 22, 30);

        Assert.Equal(new DateOnly(2026, 7, 1), ClubClock.Today(clock));
    }

    [Fact]
    public void Should_ReadTheSameDay_When_BerlinAndUtcShareTheDay()
    {
        var clock = At(2025, 11, 11, 12, 0);

        Assert.Equal(new DateOnly(2025, 11, 11), ClubClock.Today(clock));
    }

    [Fact]
    public void Should_OpenTheNewSession_When_BerlinHasReachedTheEleventhButUtcHasNot()
    {
        var clock = At(2025, 11, 10, 23, 30);

        Assert.Equal(2025, ClubSession.YearOf(ClubClock.Today(clock)));
        Assert.Equal(
            2024,
            ClubSession.YearOf(DateOnly.FromDateTime(clock.GetUtcNow().UtcDateTime))
        );
    }

    private static FakeTimeProvider At(int year, int month, int day, int hour, int minute) =>
        new(new DateTimeOffset(year, month, day, hour, minute, 0, TimeSpan.Zero));
}
