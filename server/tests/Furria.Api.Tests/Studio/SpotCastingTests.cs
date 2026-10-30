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

    [Fact]
    public void Should_StoreTheStandIn_When_TheEveningPutsHerOnASpot()
    {
        var changes = SpotCasting.EveningChangesAfter(Session, [], new(2, Carla));

        Assert.Equal([new(2, Carla)], changes);
    }

    [Fact]
    public void Should_FreeHerSessionSpot_When_TheEveningMovesHerToAnotherSpot()
    {
        var changes = SpotCasting.EveningChangesAfter(Session, [], new(3, Anna));

        Assert.Equal([new(1, null), new(3, Anna)], changes);
    }

    [Fact]
    public void Should_ForgetTheChange_When_TheEveningReturnsToTheSessionPerson()
    {
        var changes = SpotCasting.EveningChangesAfter(Session, [new(2, Carla)], new(2, Ben));

        Assert.Empty(changes);
    }

    [Fact]
    public void Should_FreeHerOtherEveningSpot_When_TheStandInMovesThatEvening()
    {
        var changes = SpotCasting.EveningChangesAfter(Session, [new(3, Carla)], new(2, Carla));

        Assert.Equal([new(2, Carla)], changes);
    }
}
