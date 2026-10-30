using Furria.Core.RunningOrders;
using Xunit;

namespace Furria.Api.Tests.RunningOrders;

public sealed class StageClockTests
{
    private static readonly DateTimeOffset EveningStart = new(2027, 2, 6, 19, 11, 0, TimeSpan.Zero);

    [Fact]
    public void Should_TakeTheMusicLength_When_TheActHasMusic()
    {
        var length = StageClock.LengthOf(ActKind.Speech, 245.5);

        Assert.Equal(TimeSpan.FromSeconds(245.5), length);
    }

    [Theory]
    [InlineData(ActKind.Dance, 6)]
    [InlineData(ActKind.Show, 8)]
    [InlineData(ActKind.Music, 5)]
    [InlineData(ActKind.Speech, 10)]
    [InlineData(ActKind.Point, 5)]
    public void Should_TakeTheTypicalLengthOfItsKind_When_TheActHasNoMusic(
        ActKind kind,
        int expectedMinutes
    )
    {
        var length = StageClock.LengthOf(kind, 0);

        Assert.Equal(TimeSpan.FromMinutes(expectedMinutes), length);
    }

    [Fact]
    public void Should_TakeTheTypicalLengthOfAPoint_When_TheActHasNoKindAndNoMusic()
    {
        var length = StageClock.LengthOf(null, 0);

        Assert.Equal(TimeSpan.FromMinutes(5), length);
    }

    [Fact]
    public void Should_StartEachActAfterTheOnesBeforeItAndAChangeover_When_TheEveningRuns()
    {
        var starts = StageClock.StartsOf(
            EveningStart,
            [TimeSpan.FromMinutes(4), TimeSpan.FromSeconds(90), TimeSpan.FromMinutes(10)]
        );

        Assert.Equal(
            [EveningStart, EveningStart.AddMinutes(6), EveningStart.AddMinutes(9.5)],
            starts
        );
    }
}
