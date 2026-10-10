namespace Furria.Tests.Common.Builder;

public sealed class TestNews
{
    public AliasRegistry<int> Posts { get; }

    internal TestNews(SeededNews seeded)
    {
        Posts = new AliasRegistry<int>("NewsPost", seeded.PostIds);
    }
}
