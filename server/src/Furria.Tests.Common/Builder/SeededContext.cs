using Furria.Tests.Common.Expectations;

namespace Furria.Tests.Common.Builder;

public sealed class SeededContext
{
    public TestIdentity Identity { get; }

    public TestGroups Groups { get; }

    public TestRoles Roles { get; }

    public TestClub Club { get; }

    public TestGallery Gallery { get; }

    public TestNews News { get; }

    public TestBeerList BeerList { get; }

    public TestGroupMatcher GroupMatcher { get; }

    public Expected Expected { get; }

    internal SeededContext(
        TestIdentity identity,
        TestGroups groups,
        TestRoles roles,
        TestClub club,
        TestGallery gallery,
        TestNews news,
        TestBeerList beerList,
        TestGroupMatcher groupMatcher,
        Expected expected
    )
    {
        Identity = identity;
        Groups = groups;
        Roles = roles;
        Club = club;
        Gallery = gallery;
        News = news;
        BeerList = beerList;
        GroupMatcher = groupMatcher;
        Expected = expected;
    }
}
