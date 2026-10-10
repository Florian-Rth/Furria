using FastEndpoints;
using Furria.Api.Endpoints.News;
using Furria.Core.News;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.News;

public sealed class GetPublicNewsTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Proclaimed = new(2025, 11, 11, 11, 11, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset Paraded = new(2026, 2, 16, 14, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset Summer = new(2025, 7, 4, 18, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset Withdrawn = new(2026, 3, 1, 9, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public GetPublicNewsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListOnlyLivePostsInTheirLiveVersion_When_PostsAreInEveryState()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(Posts(), ct);

        var (_, result) = await _fixture
            .CreateClient()
            .GETAsync<GetPublicNews, GetPublicNewsResponse>();

        Assert.Equal(
            ["umzug", "motto-verkuendet", "sommerfest"],
            result.Sessions.SelectMany(session => session.Posts).Select(post => post.Slug)
        );
        var motto = result
            .Sessions.SelectMany(session => session.Posts)
            .Single(post => post.Slug == "motto-verkuendet");
        Assert.Equal("Motto verkündet", motto.Title);
        Assert.Equal("Alter Text", motto.Text);
        Assert.Equal(NewsCategory.Session, motto.Category);
        Assert.Equal(Proclaimed, motto.PublishedAt);
        Assert.Null(motto.Picture);
    }

    [Fact]
    public async Task Should_GroupThePostsBySessionNewestFirst_When_TheySpanSessions()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(Posts(), ct);

        var (_, result) = await _fixture
            .CreateClient()
            .GETAsync<GetPublicNews, GetPublicNewsResponse>();

        Assert.Equal(
            [(2025, (int?)71, 2), (2024, null, 1)],
            result.Sessions.Select(session =>
                (session.SessionStartYear, session.SessionNumber, session.Posts.Count)
            )
        );
    }

    [Fact]
    public async Task Should_PointThePictureAtItsPublicAddress_When_ALivePostHasARenderedPicture()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var pictureId = await NewsPictureSteps.LivePictureAsync(
            client,
            ctx.News.Posts.IdOf("parade"),
            ct
        );
        await _fixture.RenderMediaItemDirectlyAsync(pictureId, ct);

        var (_, result) = await _fixture
            .CreateClient()
            .GETAsync<GetPublicNews, GetPublicNewsResponse>();

        var parade = result
            .Sessions.SelectMany(session => session.Posts)
            .Single(post => post.Slug == "umzug");
        Assert.StartsWith(
            $"/api/public/news/pictures/{pictureId}/medium?v=",
            parade.Picture?.MediumUrl
        );
    }

    private static Action<SeedContextBuilder> Posts() =>
        builder =>
            builder
                .Club(club => club.AddSession("2025", 2025, number: 71))
                .News(news =>
                    news.AddNewsPost("draft", "Entwurf", "Vorspann", "Text", NewsCategory.Club)
                        .AddNewsPost(
                            "motto",
                            "Motto verkündet",
                            "Vorspann",
                            "Alter Text",
                            NewsCategory.Session,
                            publishedAt: Proclaimed,
                            slug: "motto-verkuendet"
                        )
                        .AddPendingChanges(
                            "motto",
                            "Motto korrigiert",
                            "Vorspann",
                            "Neuer Text",
                            NewsCategory.Session
                        )
                        .AddNewsPost(
                            "parade",
                            "Umzug",
                            "Vorspann",
                            "Text",
                            NewsCategory.Groups,
                            publishedAt: Paraded,
                            slug: "umzug"
                        )
                        .AddNewsPost(
                            "summer",
                            "Sommerfest",
                            "Vorspann",
                            "Text",
                            NewsCategory.Club,
                            publishedAt: Summer,
                            slug: "sommerfest"
                        )
                        .AddNewsPost(
                            "withdrawn",
                            "Zurückgezogen",
                            "Vorspann",
                            "Text",
                            NewsCategory.Club,
                            publishedAt: Proclaimed,
                            slug: "zurueckgezogen",
                            withdrawnAt: Withdrawn
                        )
                );
}
