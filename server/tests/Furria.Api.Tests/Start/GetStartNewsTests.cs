using FastEndpoints;
using Furria.Api.Endpoints.Start;
using Furria.Application.Start;
using Furria.Core.News;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Start;

public sealed class GetStartNewsTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly JoinedIn2015 = new(2015, 11, 11);

    private readonly ApiTestFixture _fixture;

    public GetStartNewsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ShowOnlyTheNewestPublishedPost_When_ItCameOutInTheLastFortnight()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await BuildAsync(
            news =>
                news.AddNewsPost(
                        "parade",
                        "Umzug",
                        category: NewsCategory.Session,
                        publishedAt: now.AddDays(-5)
                    )
                    .AddNewsPost(
                        "gala",
                        "Prunksitzung",
                        category: NewsCategory.Achievements,
                        publishedAt: now.AddDays(-1),
                        slug: "prunksitzung"
                    )
                    .AddNewsPost(
                        "withdrawn",
                        "Zurückgezogen",
                        category: NewsCategory.Club,
                        publishedAt: now.AddHours(-2),
                        withdrawnAt: now.AddHours(-1)
                    )
                    .AddNewsPost("draft", "Entwurf", category: NewsCategory.Club),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("lena", ct);

        var (_, start) = await client.GETAsync<GetStart, GetStartResponse>();

        var panel = Assert.Single(start.Panels, panel => panel.Kind == StartPanelKind.News);
        var post = Assert.Single(panel.News!);
        Assert.Equal(1, panel.ShownCount);
        Assert.Equal(
            ("prunksitzung", "Prunksitzung", NewsCategory.Achievements, now.AddDays(-1)),
            (post.Slug, post.Title, post.Category, post.PublishedAt)
        );
    }

    [Fact]
    public async Task Should_LeaveNewsOff_When_TheNewestPostIsOlderThanAFortnight()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await BuildAsync(
            news =>
                news.AddNewsPost(
                    "parade",
                    "Umzug",
                    category: NewsCategory.Session,
                    publishedAt: now.AddDays(-15)
                ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("lena", ct);

        var (_, start) = await client.GETAsync<GetStart, GetStartResponse>();

        Assert.DoesNotContain(start.Panels, panel => panel.Kind == StartPanelKind.News);
    }

    [Fact]
    public async Task Should_ShowTheNewestPostBySomeoneElse_When_SheWroteTheNewestHerself()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await BuildAsync(
            news =>
                news.AddNewsPost(
                        "parade",
                        "Umzug",
                        category: NewsCategory.Session,
                        publishedAt: now.AddDays(-4),
                        slug: "umzug"
                    )
                    .AddNewsPost(
                        "hers",
                        "Ihre Meldung",
                        category: NewsCategory.Groups,
                        authorAlias: "lena",
                        publishedAt: now.AddDays(-1)
                    ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("lena", ct);

        var (_, start) = await client.GETAsync<GetStart, GetStartResponse>();

        var panel = Assert.Single(start.Panels, panel => panel.Kind == StartPanelKind.News);
        Assert.Equal(["umzug"], panel.News!.Select(post => post.Slug));
    }

    private Task<SeededContext> BuildAsync(
        Action<NewsSeedBuilder> arrangeNews,
        CancellationToken ct
    ) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("lena", "Lena", "Garde")
                            .AddAccount("lena")
                            .AddMembership("lena-membership", "lena", JoinedIn2015)
                    )
                    .News(arrangeNews),
            ct
        );
}
