using Furria.Tests.Common.Expectations;

namespace Furria.Tests.Common.Builder;

public sealed class SeededContext
{
    public TestIdentity Identity { get; }

    public TestRoles Roles { get; }

    public Expected Expected { get; }

    internal SeededContext(TestIdentity identity, TestRoles roles, Expected expected)
    {
        Identity = identity;
        Roles = roles;
        Expected = expected;
    }
}
