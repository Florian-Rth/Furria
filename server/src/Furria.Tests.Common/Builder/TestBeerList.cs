namespace Furria.Tests.Common.Builder;

public sealed class TestBeerList
{
    public AliasRegistry<int> Pots { get; }

    public AliasRegistry<int> Enrollments { get; }

    internal TestBeerList(SeededBeerList seeded)
    {
        Pots = new AliasRegistry<int>("BeerPot", seeded.PotIds);
        Enrollments = new AliasRegistry<int>("BeerListEnrollment", seeded.EnrollmentIds);
    }
}
