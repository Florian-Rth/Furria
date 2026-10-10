using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.News;
using Furria.Core.News;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.News;

public sealed class PutNewsPostTests : IClassFixture<ApiTestFixture>
{
    private const int SeededRevision = 1;
    private const string Credit = "Foto: Jan Becker";

    private static readonly DateTimeOffset Proclaimed = new(2025, 11, 11, 11, 11, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset Shown = new(2026, 2, 20, 9, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public PutNewsPostTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_SaveTheDraftItselfAndCountTheRevisionUp_When_ADraftIsSaved()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var draftId = ctx.News.Posts.IdOf("draft");
        var gardeId = ctx.Groups.Groups.IdOf("garde");

        var (response, result) = await PutAsync(
            client,
            Saved(draftId, "Neues Motto", $"Mit der @[Garde](group:{gardeId})")
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(SeededRevision + 1, result.Revision);
        Assert.Null(result.SavedInBetween);
        await ctx
            .Expected.NewsPost(draftId)
            .ToRead(
                "Neues Motto",
                "Vorspann",
                $"Mit der @[Garde](group:{gardeId})",
                NewsCategory.Session
            )
            .NewsPost(draftId)
            .ToMention(new NewsMention(NewsMentionKind.Group, gardeId))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheLiveVersionAndHoldTheEditAsPendingChanges_When_APublishedPostIsSaved()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var liveId = ctx.News.Posts.IdOf("live");
        var gardeId = ctx.Groups.Groups.IdOf("garde");

        await PutAsync(client, Saved(liveId, "Korrigiert", $"Mit der @[Garde](group:{gardeId})"));

        await ctx
            .Expected.NewsPost(liveId)
            .ToRead("Das Motto steht", "Vorspann", "Alter Text", NewsCategory.Session)
            .NewsPost(liveId)
            .ToHavePendingChanges("Korrigiert", $"Mit der @[Garde](group:{gardeId})")
            .NewsPost(liveId)
            .ToMention()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SaveTheWithdrawnPostItself_When_AWithdrawnPostIsSaved()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var withdrawnId = ctx.News.Posts.IdOf("withdrawn");

        await PutAsync(client, Saved(withdrawnId, "Überarbeitet", "Neuer Text"));

        await ctx
            .Expected.NewsPost(withdrawnId)
            .ToRead("Überarbeitet", "Vorspann", "Neuer Text", NewsCategory.Session)
            .NewsPost(withdrawnId)
            .ToHaveNoPendingChanges()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SaveAndNameWhoSavedInBetween_When_SomeoneSavedInBetween()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var editor = await ctx.Identity.ClientForAsync(NewsSeeds.Editor, ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var draftId = ctx.News.Posts.IdOf("draft");
        await PutAsync(editor, Saved(draftId, "Erste Fassung", "Text"));

        var (response, result) = await PutAsync(client, Saved(draftId, "Zweite Fassung", "Text"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Nele", result.SavedInBetween?.SavedBy?.FirstName);
        Assert.Equal(_fixture.TimeProvider.GetUtcNow(), result.SavedInBetween?.SavedAt);
        await ctx
            .Expected.NewsPost(draftId)
            .ToRead("Zweite Fassung", "Vorspann", "Text", NewsCategory.Session)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepAnAlbumTie_When_TheTiedAlbumWasUnpublishedSince()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var tiedId = ctx.News.Posts.IdOf("tied");
        var hiddenId = ctx.Gallery.Albums.IdOf("hidden");

        var (response, _) = await PutAsync(
            client,
            Saved(tiedId, "Rückblick", "Text") with
            {
                AlbumId = hiddenId,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx.Expected.NewsPost(tiedId).ToBeTiedTo(null, hiddenId).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheSave_When_TheTextLeavesTheSubset()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var draftId = ctx.News.Posts.IdOf("draft");

        var (response, _) = await PutAsync(client, Saved(draftId, "Titel", "<b>fett</b>"));

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ctx
            .Expected.NewsPost(draftId)
            .ToRead("Entwurf", "Vorspann", "Text", NewsCategory.Session)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SaveTheCaptionWithTheDraft_When_ADraftIsSavedWithACaption()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var draftId = ctx.News.Posts.IdOf("draft");
        var pictureId = await NewsPictureSteps.UploadAsync(client, draftId, ct);

        await PutAsync(client, Saved(draftId, "Entwurf", "Text") with { PictureCaption = Credit });

        await ctx.Expected.NewsPost(draftId).ToShowPicture(pictureId, Credit).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_HoldTheCaptionWithTheLivePictureInTheWorkingCopy_When_ALivePostIsSaved()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var liveId = ctx.News.Posts.IdOf("live");
        var pictureId = await NewsPictureSteps.LivePictureAsync(client, liveId, ct);

        await PutAsync(
            client,
            Saved(liveId, "Das Motto steht", "Text") with
            {
                PictureCaption = Credit,
            }
        );

        await ctx
            .Expected.NewsPost(liveId)
            .ToShowPicture(pictureId)
            .NewsPost(liveId)
            .ToHavePendingPicture(pictureId, Credit)
            .AssertAsync(ct);
    }

    private static Task<TestResult<PutNewsPostResponse>> PutAsync(
        HttpClient client,
        PutNewsPostRequest request
    ) => client.PUTAsync<PutNewsPost, PutNewsPostRequest, PutNewsPostResponse>(request);

    private static PutNewsPostRequest Saved(int newsPostId, string title, string text) =>
        new()
        {
            NewsPostId = newsPostId,
            BasedOnRevision = SeededRevision,
            Title = title,
            Teaser = "Vorspann",
            Text = text,
            Category = NewsCategory.Session,
            EventId = null,
            AlbumId = null,
            PictureCaption = null,
        };

    private static Action<SeedContextBuilder> Posts() =>
        builder =>
            builder
                .WithNewsEditor()
                .Groups(groups => groups.AddGroup("garde", "Stadtgarde"))
                .Gallery(gallery => gallery.AddAlbum("hidden", "Probe", sessionStartYear: 2025))
                .News(news =>
                    news.AddNewsPost("draft", "Entwurf", "Vorspann", "Text", NewsCategory.Session)
                        .AddNewsPost(
                            "live",
                            "Das Motto steht",
                            "Vorspann",
                            "Alter Text",
                            NewsCategory.Session,
                            publishedAt: Proclaimed
                        )
                        .AddNewsPost(
                            "withdrawn",
                            "Zurückgezogen",
                            "Vorspann",
                            "Text",
                            NewsCategory.Session,
                            publishedAt: Proclaimed,
                            withdrawnAt: Shown
                        )
                        .AddNewsPost("tied", "Rückblick", "Vorspann", "Text", albumAlias: "hidden")
                );
}
