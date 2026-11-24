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
