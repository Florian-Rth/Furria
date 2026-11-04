namespace Furria.Tests.Common.Builder;

public sealed class TestBeerList
{
    public AliasRegistry<int> Pots { get; }

    public AliasRegistry<int> Enrollments { get; }

    public AliasRegistry<int> Crates { get; }

    public AliasRegistry<int> Payments { get; }

    internal TestBeerList(SeededBeerList seeded)
    {
        Pots = new AliasRegistry<int>("BeerPot", seeded.PotIds);
        Enrollments = new AliasRegistry<int>("BeerListEnrollment", seeded.EnrollmentIds);
        Crates = new AliasRegistry<int>("BeerCrate", seeded.CrateIds);
        Payments = new AliasRegistry<int>("BeerPayment", seeded.PaymentIds);
    }
}
