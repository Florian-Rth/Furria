namespace Furria.Tests.Common.Builder;

public sealed class TestIntakes
{
    public AliasRegistry<int> Intakes { get; }

    public AliasRegistry<string> LinkTokens { get; }

    internal TestIntakes(SeededIntakes seeded)
    {
        Intakes = new AliasRegistry<int>("Intake", seeded.IntakeIds);
        LinkTokens = new AliasRegistry<string>("IntakeLinkToken", seeded.LinkTokens);
    }
}
