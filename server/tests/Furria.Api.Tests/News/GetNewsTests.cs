using FastEndpoints;
using Furria.Api.Endpoints.News;
using Furria.Core.News;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.News;

public sealed class GetNewsTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset LastSession = new(2025, 1, 20, 18, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset Proclaimed = new(2025, 11, 11, 11, 11, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset Gala = new(2026, 2, 15, 10, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset Withdrawn = new(2026, 2, 16, 10, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public GetNewsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_LeadWithTheDraftsThenEachSessionNewestFirst_When_TheHubIsOpened()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, result) = await client.GETAsync<GetNews, GetNewsResponse>();

        Assert.Equal(
            [(null, null), (2025, 55), (2024, null)],
            result.Sections.Select(section => (section.SessionStartYear, section.SessionNumber))
        );
        Assert.Equal(
            [
                ["Entwurf"],
                ["Gala-Rückblick", "Zurückgezogen", "Das Motto steht fest"],
                ["Altweiber"],
            ],
            result.Sections.Select(section => section.Posts.Select(post => post.Title))
        );
    }

    [Fact]
    public async Task Should_TellStatePendingChangesAndAuthor_When_ThePostsAreListed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, result) = await client.GETAsync<GetNews, GetNewsResponse>();
        var posts = result.Sections.SelectMany(section => section.Posts).ToList();

        var motto = posts.Single(post => post.Title == "Das Motto steht fest");
        Assert.Equal(NewsPostState.Published, motto.State);
        Assert.True(motto.HasPendingChanges);
        Assert.Equal("Nele", motto.Author?.FirstName);
        Assert.Equal(
            NewsPostState.Withdrawn,
            posts.Single(post => post.Title == "Zurückgezogen").State
        );
        var draft = posts.Single(post => post.Title == "Entwurf");
        Assert.Equal(NewsPostState.Draft, draft.State);
        Assert.Null(draft.Author);
    }

    [Fact]
    public async Task Should_DescribeTheWorkingVersion_When_APublishedPostHasPendingChanges()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, result) = await client.GETAsync<GetNews, GetNewsResponse>();
        var posts = result.Sections.SelectMany(section => section.Posts).ToList();

        var motto = posts.Single(post => post.Title == "Das Motto steht fest");
        Assert.NotNull(motto.PendingSavedAt);
        Assert.Equal(
            [NewsPublicationRequirement.Teaser, NewsPublicationRequirement.Text],
            motto.Missing
        );
        Assert.Equal(Withdrawn, posts.Single(post => post.Title == "Zurückgezogen").WithdrawnAt);
    }

    [Fact]
    public async Task Should_NameEverythingStillMissingForPublishing_When_ADraftIsListed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, result) = await client.GETAsync<GetNews, GetNewsResponse>();

        var draft = result
            .Sections.SelectMany(section => section.Posts)
            .Single(post => post.Title == "Entwurf");
        Assert.Equal(
            [
                NewsPublicationRequirement.Category,
                NewsPublicationRequirement.Teaser,
                NewsPublicationRequirement.Text,
            ],
            draft.Missing
        );
    }

    [Fact]
    public async Task Should_ShowTheWorkingPicture_When_ItIsRendered()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var pictureId = await NewsPictureSteps.UploadAsync(
            client,
            ctx.News.Posts.IdOf("draft"),
            ct
        );
        await _fixture.RenderMediaItemDirectlyAsync(pictureId, ct);

        var (_, result) = await client.GETAsync<GetNews, GetNewsResponse>();

        var draft = result
            .Sections.SelectMany(section => section.Posts)
            .Single(post => post.Title == "Entwurf");
        Assert.NotNull(draft.Picture);
    }

    private static Action<SeedContextBuilder> Posts() =>
        builder =>
            builder
                .WithNewsEditor()
                .Club(club => club.AddSession("2025", 2025, number: 55))
                .News(news =>
                    news.AddNewsPost("draft", "Entwurf")
                        .AddNewsPost(
                            "motto",
                            "Das Motto steht",
                            authorAlias: NewsSeeds.Editor,
                            publishedAt: Proclaimed
                        )
                        .AddPendingChanges(
                            "motto",
                            "Das Motto steht fest",
                            category: NewsCategory.Session
                        )
                        .AddNewsPost("gala", "Gala-Rückblick", publishedAt: Gala)
                        .AddNewsPost(
                            "withdrawn",
                            "Zurückgezogen",
                            publishedAt: Gala.AddHours(-1),
                            withdrawnAt: Withdrawn
                        )
                        .AddNewsPost("altweiber", "Altweiber", publishedAt: LastSession)
                );
}
