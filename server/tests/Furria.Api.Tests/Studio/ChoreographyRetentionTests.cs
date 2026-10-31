using Furria.Core.Studio;
using Xunit;

namespace Furria.Api.Tests.Studio;

public sealed class ChoreographyRetentionTests
{
    private static readonly DateTimeOffset Now = new(2026, 10, 31, 12, 0, 0, TimeSpan.Zero);

    [Fact]
    public void Should_KeepEveryVersion_When_ItWasSavedInTheLastFourteenDays()
    {
        var versions = new[]
        {
            Saved(1, Now.AddDays(-14).AddHours(-11)),
            Saved(2, Now.AddDays(-14).AddHours(-10)),
            Saved(3, Now.AddMinutes(-1)),
            Saved(4, Now),
        };

        Assert.Empty(ChoreographyRetention.ThinnedOf(versions, Now));
    }

    [Fact]
    public void Should_KeepOnlyTheLastVersionOfADay_When_TheDayIsOlderThanFourteenDays()
    {
        var versions = new[]
        {
            Saved(1, Now.AddDays(-20).AddHours(-3)),
            Saved(2, Now.AddDays(-20).AddHours(-2)),
            Saved(3, Now.AddDays(-20).AddHours(-1)),
            Saved(4, Now.AddDays(-19)),
            Saved(5, Now),
        };

        Assert.Equal([1, 2], ChoreographyRetention.ThinnedOf(versions, Now));
    }

    [Fact]
    public void Should_CountTheDayOnTheClubsClock_When_VersionsStraddleUtcMidnight()
    {
        var versions = new[]
        {
            Saved(1, new DateTimeOffset(2026, 10, 1, 21, 30, 0, TimeSpan.Zero)),
            Saved(2, new DateTimeOffset(2026, 10, 1, 22, 30, 0, TimeSpan.Zero)),
            Saved(3, new DateTimeOffset(2026, 10, 2, 0, 30, 0, TimeSpan.Zero)),
        };

        Assert.Equal([2], ChoreographyRetention.ThinnedOf(versions, Now));
    }

    [Fact]
    public void Should_KeepAnAdoptedFinalTrack_When_ItsDayIsThinnedOut()
    {
        var versions = new[]
        {
            Saved(1, Now.AddDays(-20).AddHours(-3)),
            new ChoreographyVersionStamp(
                2,
                ChoreographyVersionKind.MusicAdopted,
                Now.AddDays(-20).AddHours(-2)
            ),
            Saved(3, Now.AddDays(-20).AddHours(-1)),
        };

        Assert.Equal([1], ChoreographyRetention.ThinnedOf(versions, Now));
    }

    private static ChoreographyVersionStamp Saved(int version, DateTimeOffset savedAt) =>
        new(version, ChoreographyVersionKind.Saved, savedAt);
}
