namespace Furria.Tests.Common.Builder;

public sealed class TestClub
{
    public AliasRegistry<int> Sessions { get; }

    internal TestClub(SeededClub seeded)
    {
        Sessions = new AliasRegistry<int>("Session", seeded.SessionIds);
    }
}
