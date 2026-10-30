using Furria.Core.RunningOrders;
using Furria.Core.Studio;
using Xunit;

namespace Furria.Api.Tests.Studio;

public sealed class ActReadinessTests
{
    private static readonly ActReadinessFacts Nothing = new(
        SongCount: 0,
        HasAdoptedFinalFile: false,
        StepCount: 0,
        SpotCount: 0,
        HeldSpotCount: 0,
        PlacedSpotCount: 0,
        VideoCount: 0,
        CastCount: 0
    );

    private static readonly ActReadinessFacts Everything = new(
        SongCount: 2,
        HasAdoptedFinalFile: true,
        StepCount: 8,
        SpotCount: 6,
        HeldSpotCount: 6,
        PlacedSpotCount: 6,
        VideoCount: 1,
        CastCount: 6
    );

    [Fact]
    public void Should_ListEveryStudioCheckOpen_When_ADanceHasNothingYet()
    {
        var checks = ActReadiness.ChecksOf(ActKind.Dance, Nothing);

        Assert.Equal(
            [
                ReadinessCheck.Music,
                ReadinessCheck.Steps,
                ReadinessCheck.Formation,
                ReadinessCheck.Videos,
                ReadinessCheck.FinalFile,
                ReadinessCheck.Cast,
            ],
            checks.Select(check => check.Check)
        );
        Assert.All(checks, check => Assert.False(check.IsDone));
    }

    [Fact]
    public void Should_MarkEveryCheckDone_When_AShowIsComplete()
    {
        var checks = ActReadiness.ChecksOf(ActKind.Show, Everything);

        Assert.Equal(6, checks.Count);
        Assert.All(checks, check => Assert.True(check.IsDone));
    }

    [Theory]
    [InlineData(ActKind.Speech)]
    [InlineData(ActKind.Music)]
    [InlineData(ActKind.Point)]
    [InlineData(null)]
    public void Should_OnlyCheckTheCast_When_TheActGetsNoStudio(ActKind? kind)
    {
        var check = Assert.Single(ActReadiness.ChecksOf(kind, Everything));

        Assert.Equal(ReadinessCheck.Cast, check.Check);
        Assert.True(check.IsDone);
    }

    [Theory]
    [InlineData(6, 5, 6)]
    [InlineData(6, 6, 5)]
    [InlineData(0, 0, 0)]
    public void Should_LeaveTheFormationOpen_When_ASpotIsUnheldOrUnplaced(
        int spots,
        int held,
        int placed
    )
    {
        var facts = Everything with
        {
            SpotCount = spots,
            HeldSpotCount = held,
            PlacedSpotCount = placed,
        };

        var formation = ActReadiness
            .ChecksOf(ActKind.Dance, facts)
            .Single(check => check.Check == ReadinessCheck.Formation);

        Assert.False(formation.IsDone);
    }

    [Fact]
    public void Should_CountMusicAsDone_When_OnlyTheFinalFileIsAdopted()
    {
        var facts = Nothing with { HasAdoptedFinalFile = true };

        var music = ActReadiness
            .ChecksOf(ActKind.Dance, facts)
            .Single(check => check.Check == ReadinessCheck.Music);

        Assert.True(music.IsDone);
    }
}
