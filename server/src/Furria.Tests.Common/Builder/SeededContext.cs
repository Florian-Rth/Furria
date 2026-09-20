using Furria.Tests.Common.Expectations;

namespace Furria.Tests.Common.Builder;

public sealed class SeededContext
{
    public TestIdentity Identity { get; }

    public TestGroups Groups { get; }

    public TestRoles Roles { get; }

    public TestClub Club { get; }

    public Expected Expected { get; }

    internal SeededContext(
        TestIdentity identity,
        TestGroups groups,
        TestRoles roles,
        TestClub club,
        Expected expected
    )
    {
        Identity = identity;
        Groups = groups;
        Roles = roles;
        Club = club;
        Expected = expected;
    }
}
