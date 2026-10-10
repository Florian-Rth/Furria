using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.News;
using Furria.Core.News;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.News;

public sealed class PublishNewsPostTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Proclaimed = new(2025, 11, 11, 11, 11, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset Withdrawn = new(2025, 12, 1, 9, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public PublishNewsPostTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_FixTheAddressFromTheTitleAndDateItNow_When_ADraftIsPublished()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var draftId = ctx.News.Posts.IdOf("draft");

        var response = await PublishAsync(client, draftId);

        var published = await response.Content.ReadFromJsonAsync<PublishNewsPostResponse>(ct);
        Assert.Equal("maennerballett-in-der-scala", published?.Slug);
        Assert.Equal(_fixture.TimeProvider.GetUtcNow(), published?.PublishedAt);
        await ctx
            .Expected.NewsPost(draftId)
            .ToBePublished(_fixture.TimeProvider.GetUtcNow(), "maennerballett-in-der-scala")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_NumberTheAddress_When_AnotherPostAlreadyHoldsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var twinId = ctx.News.Posts.IdOf("twin");

        await PublishAsync(client, twinId);

        await ctx
            .Expected.NewsPost(twinId)
            .ToBePublished(_fixture.TimeProvider.GetUtcNow(), "das-motto-steht-2")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepItsAddressAndDate_When_AWithdrawnPostIsPublishedAgainUnderANewTitle()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var withdrawnId = ctx.News.Posts.IdOf("withdrawn");

        var response = await PublishAsync(client, withdrawnId);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.NewsPost(withdrawnId)
            .ToBePublished(Proclaimed, "alter-titel")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseToPublish_When_TheCategoryIsMissing()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var uncategorisedId = ctx.News.Posts.IdOf("uncategorised");

        var response = await PublishAsync(client, uncategorisedId);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx.Expected.NewsPost(uncategorisedId).ToBeADraft().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseToPublish_When_TheTeaserIsBlank()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await PublishAsync(client, ctx.News.Posts.IdOf("teaserless"));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    private static Task<HttpResponseMessage> PublishAsync(HttpClient client, int newsPostId) =>
        client.POSTAsync<PublishNewsPost, PublishNewsPostRequest>(
            new() { NewsPostId = newsPostId }
        );

    private static Action<SeedContextBuilder> Posts() =>
        builder =>
            builder.News(news =>
                news.AddNewsPost(
                        "draft",
                        "Männerballett in der Scala!",
                        "Vorspann",
                        "Text",
                        NewsCategory.Groups
                    )
                    .AddNewsPost(
                        "taken",
                        "Das Motto steht",
                        "Vorspann",
                        "Text",
                        NewsCategory.Session,
                        publishedAt: Proclaimed,
                        slug: "das-motto-steht"
                    )
                    .AddNewsPost("twin", "Das Motto steht", "Vorspann", "Text", NewsCategory.Club)
                    .AddNewsPost(
                        "withdrawn",
                        "Neuer Titel",
                        "Vorspann",
                        "Text",
                        NewsCategory.Club,
                        publishedAt: Proclaimed,
                        slug: "alter-titel",
                        withdrawnAt: Withdrawn
                    )
                    .AddNewsPost("uncategorised", "Ohne Kategorie", "Vorspann", "Text")
                    .AddNewsPost("teaserless", "Ohne Vorspann", " ", "Text", NewsCategory.Club)
            );
}
