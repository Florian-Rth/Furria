using Furria.Core.Studio;
using Xunit;

namespace Furria.Api.Tests.Studio;

public sealed class SpotCastingTests
{
    private const int Anna = 101;
    private const int Ben = 102;
    private const int Carla = 103;

    private static readonly SpotAssignment[] Session = [new(1, Anna), new(2, Ben), new(3, null)];

    [Fact]
    public void Should_KeepTheSessionPeople_When_TheEveningChangesNothing()
    {
        Assert.Equal(Session, SpotCasting.EveningOf(Session, []));
    }

    [Fact]
    public void Should_PutTheStandInOnTheSpot_When_TheEveningReassignsIt()
    {
        var evening = SpotCasting.EveningOf(Session, [new(2, Carla), new(1, null)]);

        Assert.Equal([new(1, null), new(2, Carla), new(3, null)], evening);
    }

    [Fact]
    public void Should_NameThePerson_When_SheStandsOnTwoSpotsThatEvening()
    {
        var evening = SpotCasting.EveningOf(Session, [new(3, Anna)]);

        Assert.Equal([Anna], SpotCasting.PeopleOnSeveralSpots(evening));
    }

    [Fact]
    public void Should_NameNobody_When_OpenSpotsAreTheOnlyRepeats()
    {
        var evening = SpotCasting.EveningOf(Session, [new(1, null)]);

        Assert.Empty(SpotCasting.PeopleOnSeveralSpots(evening));
    }
}
