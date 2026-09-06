using Furria.Tests.Common.Expectations;

namespace Furria.Tests.Common.Builder;

public sealed class SeededContext
{
    public TestIdentity Identity { get; }

    public Expected Expected { get; }

    internal SeededContext(TestIdentity identity, Expected expected)
    {
        Identity = identity;
        Expected = expected;
    }
}
