using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.News;
using Furria.Core.News;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.News;

public sealed class PublishNewsPostChangesTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Proclaimed = new(2025, 11, 11, 11, 11, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public PublishNewsPostChangesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_PutThePendingChangesLiveAndKeepAddressAndDate_When_TheyArePublished()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var editedId = ctx.News.Posts.IdOf("edited");
        var paulaId = ctx.Identity.People.IdOf("paula");

        var response = await PublishChangesAsync(client, editedId);

        var published = await response.Content.ReadFromJsonAsync<PublishNewsPostChangesResponse>(
            ct
        );
        Assert.Equal("gardetanz", published?.Slug);
        Assert.Equal(Proclaimed, published?.PublishedAt);
        await ctx
            .Expected.NewsPost(editedId)
            .ToRead(
                "Ganz neuer Titel",
                "Neuer Vorspann",
                $"Dank an @[Paula](person:{paulaId})",
                NewsCategory.Club
            )
            .NewsPost(editedId)
            .ToBePublished(Proclaimed, "gardetanz")
            .NewsPost(editedId)
            .ToHaveNoPendingChanges()
            .NewsPost(editedId)
            .ToMention(new NewsMention(NewsMentionKind.Person, paulaId))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseAndKeepThemPending_When_ThePendingChangesLackAPublishingField()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var halfId = ctx.News.Posts.IdOf("half-edited");

        var response = await PublishChangesAsync(client, halfId);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx.Expected.NewsPost(halfId).ToHavePendingChanges("", "Text").AssertAsync(ct);
    }

    [Fact]
    public async Task Should_Refuse_When_ThereAreNoPendingChanges()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await PublishChangesAsync(client, ctx.News.Posts.IdOf("untouched"));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_PutThePendingPictureLiveAndDeleteTheFormerOne_When_TheChangesArePublished()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var postId = ctx.News.Posts.IdOf("untouched");
        var formerId = await NewsPictureSteps.LivePictureAsync(client, postId, ct);
        var pictureId = await NewsPictureSteps.UploadAsync(client, postId, ct);

        var response = await PublishChangesAsync(client, postId);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.NewsPost(postId)
            .ToShowPicture(pictureId)
            .NewsPost(postId)
            .ToHaveNoPendingChanges()
            .MediaItem(formerId)
            .ToBeGone()
            .AssertAsync(ct);
    }

    private static Task<HttpResponseMessage> PublishChangesAsync(
        HttpClient client,
        int newsPostId
    ) =>
        client.POSTAsync<PublishNewsPostChanges, PublishNewsPostChangesRequest>(
            new() { NewsPostId = newsPostId }
        );

    private static Action<SeedContextBuilder> Posts() =>
        builder =>
            builder
                .Identity(identity => identity.AddPerson("paula", "Paula", "Becker"))
                .News(news =>
                    news.AddNewsPost(
                            "edited",
                            "Gardetanz",
                            "Vorspann",
                            "Text",
                            NewsCategory.Groups,
                            publishedAt: Proclaimed,
                            slug: "gardetanz"
                        )
                        .AddPendingChanges(
                            "edited",
                            "Ganz neuer Titel",
                            "Neuer Vorspann",
                            "Dank an @[Paula](person:{paula})",
                            NewsCategory.Club
                        )
                        .AddNewsPost(
                            "half-edited",
                            "Probe",
                            "Vorspann",
                            "Text",
                            NewsCategory.Groups,
                            publishedAt: Proclaimed
                        )
                        .AddPendingChanges(
                            "half-edited",
                            "",
                            "Vorspann",
                            "Text",
                            NewsCategory.Groups
                        )
                        .AddNewsPost(
                            "untouched",
                            "Unberührt",
                            "Vorspann",
                            "Text",
                            NewsCategory.Club,
                            publishedAt: Proclaimed
                        )
                );
}
