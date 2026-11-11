namespace Furria.Tests.Common.Builder;

public sealed class TestGroupMatcher
{
    public AliasRegistry<int> Statements { get; }

    internal TestGroupMatcher(SeededGroupMatcher seeded)
    {
        Statements = new AliasRegistry<int>("MatcherStatement", seeded.StatementIds);
    }
}
