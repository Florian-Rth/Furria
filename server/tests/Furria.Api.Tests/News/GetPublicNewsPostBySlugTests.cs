using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.News;
using Furria.Api.Tests.Media;
using Furria.Core.Groups;
using Furria.Core.News;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.News;

public sealed class GetPublicNewsPostBySlugTests : IClassFixture<ApiTestFixture>
{
    private const int SeededRevision = 1;
    private const int StripLength = 8;
    private const string Credit = "Foto: Paula Becker";

    private static readonly DateTimeOffset Proclaimed = new(2025, 11, 11, 11, 11, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset Shown = new(2026, 2, 20, 9, 0, 0, TimeSpan.Zero);
    private static readonly DateOnly LongAgo = new(2020, 1, 1);
    private static readonly DateOnly Archived = new(2024, 6, 30);

    private readonly ApiTestFixture _fixture;

    public GetPublicNewsPostBySlugTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ShowTheLiveVersionWithItsByline_When_APublishedPostIsAskedFor()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(Club(), ct);

        var (_, result) = await GetAsync("motto-verkuendet");

        Assert.Equal("Motto verkündet", result.Title);
        Assert.Equal("Alter Text", result.Text);
        Assert.Equal(NewsCategory.Session, result.Category);
        Assert.Equal(Proclaimed, result.PublishedAt);
        Assert.Equal(("Nele", "Neumann"), (result.Author?.FirstName, result.Author?.LastName));
        Assert.Null(result.Picture);
    }

    [Theory]
    [InlineData("zurueckgezogen")]
    [InlineData("unbekannt")]
    public async Task Should_AnswerNotFound_When_NoLivePostHasTheAddress(string slug)
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(Club(), ct);

        var (response, _) = await GetAsync(slug);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_CarryCardsOnlyForTargetsShownPublicly_When_TheTextMentionsThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Club(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var paulaId = ctx.Identity.People.IdOf("paula");
        var portraitId = await PictureSteps.RenderedPortraitAsync(_fixture, client, paulaId, ct);
        var text = string.Join(
            "\n\n",
            $"Die @[Garde](group:{ctx.Groups.Groups.IdOf("garde")}) tanzt.",
            $"Die @[Altherren](group:{ctx.Groups.Groups.IdOf("alt")}) schauen zu.",
            $"@[Paula](person:{paulaId}) und @[Kai](person:{ctx.Identity.People.IdOf("kai")}) klatschen."
        );
        await PublishAsync(client, ctx.News.Posts.IdOf("article"), Article(text));

        var (_, result) = await GetAsync("festbericht");

        var garde = Assert.Single(result.MentionedGroups);
        Assert.Equal(
            ("Stadtgarde", "Unsere Tanzgarde", (GroupTone?)GroupTone.Teal),
            (garde.Name, garde.Description, garde.Tone)
        );
        var paula = Assert.Single(result.MentionedPersons);
        Assert.Equal(paulaId, paula.PersonId);
        Assert.Equal("Präsidentin", paula.OfficeName);
        Assert.StartsWith(
            $"/api/public/board/portraits/{portraitId}/small?v=",
            paula.Portrait?.SmallUrl
        );
    }

    [Fact]
    public async Task Should_ShowTheEventTie_When_TheWebsiteStillShowsTheEvent()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Club(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        await PublishAsync(
            client,
            ctx.News.Posts.IdOf("article"),
            Article("Text") with
            {
                EventId = ctx.Club.Events.IdOf("ahead"),
            }
        );

        var (_, result) = await GetAsync("festbericht");

        Assert.Equal(ctx.Club.Events.IdOf("ahead"), result.Event?.EventId);
        Assert.Equal(("Kinderball", "Bürgerhaus"), (result.Event?.Title, result.Event?.VenueName));
        Assert.False(result.Event?.IsCancelled);
    }

    [Fact]
    public async Task Should_DropTheEventTie_When_TheEventIsOver()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Club(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        await PublishAsync(
            client,
            ctx.News.Posts.IdOf("article"),
            Article("Text") with
            {
                EventId = ctx.Club.Events.IdOf("over"),
            }
        );

        var (_, result) = await GetAsync("festbericht");

        Assert.Null(result.Event);
    }

    [Fact]
    public async Task Should_ShowTheFirstPhotosOfThePublicSelection_When_TheTiedAlbumIsPublished()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Club(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        await PublishAsync(
            client,
            ctx.News.Posts.IdOf("article"),
            Article("Text") with
            {
                AlbumId = ctx.Gallery.Albums.IdOf("shown"),
            }
        );

        var (_, result) = await GetAsync("festbericht");

        Assert.Equal(
            ("Prunksitzung", StripLength + 1),
            (result.Album?.Title, result.Album?.PhotoCount)
        );
        var first = ctx.Gallery.Items.IdOf("photo-1");
        Assert.Equal(
            [
                ctx.Gallery.Items.IdOf("photo-1"),
                ctx.Gallery.Items.IdOf("photo-2"),
                ctx.Gallery.Items.IdOf("photo-3"),
                ctx.Gallery.Items.IdOf("photo-4"),
                ctx.Gallery.Items.IdOf("photo-5"),
                ctx.Gallery.Items.IdOf("photo-6"),
                ctx.Gallery.Items.IdOf("photo-7"),
                ctx.Gallery.Items.IdOf("photo-8"),
            ],
            result.Album?.Photos.Select(photo => photo.MediaItemId)
        );
        Assert.Equal($"/api/public/gallery/photos/{first}/small", result.Album?.Photos[0].SmallUrl);
    }

    [Theory]
    [InlineData("versteckt")]
    [InlineData("leer")]
    public async Task Should_DropTheAlbumTie_When_TheWebsiteCannotShowTheAlbum(string slug)
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(Club(), ct);

        var (_, result) = await GetAsync(slug);

        Assert.Null(result.Album);
    }

    [Fact]
    public async Task Should_PointTheLivePictureAtItsPublicAddress_When_ThePostHasOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Club(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var articleId = ctx.News.Posts.IdOf("article");
        var pictureId = await NewsPictureSteps.UploadAsync(client, articleId, ct);
        await _fixture.RenderMediaItemDirectlyAsync(pictureId, ct);
        await PublishAsync(client, articleId, Article("Text") with { PictureCaption = Credit });

        var (_, result) = await GetAsync("festbericht");

        Assert.StartsWith(
            $"/api/public/news/pictures/{pictureId}/large?v=",
            result.Picture?.LargeUrl
        );
        Assert.Equal(Credit, result.PictureCaption);
    }

    private Task<TestResult<GetPublicNewsPostBySlugResponse>> GetAsync(string slug) =>
        _fixture
            .CreateClient()
            .GETAsync<
                GetPublicNewsPostBySlug,
                GetPublicNewsPostBySlugRequest,
                GetPublicNewsPostBySlugResponse
            >(new() { Slug = slug });

    private static async Task PublishAsync(
        HttpClient client,
        int newsPostId,
        PutNewsPostRequest content
    )
    {
        var saved = await client.PUTAsync<PutNewsPost, PutNewsPostRequest, PutNewsPostResponse>(
            content with
            {
                NewsPostId = newsPostId,
            }
        );
        Assert.Equal(HttpStatusCode.OK, saved.Response.StatusCode);
        var published = await client.POSTAsync<PublishNewsPost, PublishNewsPostRequest>(
            new() { NewsPostId = newsPostId }
        );
        Assert.Equal(HttpStatusCode.OK, published.StatusCode);
    }

    private static PutNewsPostRequest Article(string text) =>
        new()
        {
            NewsPostId = 0,
            BasedOnRevision = SeededRevision,
            Title = "Festbericht",
            Teaser = "Vorspann",
            Text = text,
            Category = NewsCategory.Groups,
            EventId = null,
            AlbumId = null,
            PictureCaption = null,
        };

    private Action<SeedContextBuilder> Club()
    {
        var now = _fixture.TimeProvider.GetUtcNow();

        return builder =>
            builder
                .WithNewsEditor()
                .Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Becker")
                        .AddPerson("kai", "Kai", "Kassierer")
                )
                .Groups(groups =>
                    groups
                        .AddGroup("garde", "Stadtgarde", "Unsere Tanzgarde", tone: GroupTone.Teal)
                        .AddGroup("alt", "Altherren", archivedOn: Archived)
                )
                .Club(club =>
                    club.AddBoardOffice("praesidentin", "Präsidentin", 1, isPublic: true)
                        .AddBoardOffice("kasse", "Kasse", 2)
                        .AddBoardSeat("paula-seat", "praesidentin", "paula", LongAgo)
                        .AddBoardSeat("kai-seat", "kasse", "kai", LongAgo)
                        .AddVenue("saal", "Bürgerhaus")
                        .AddEvent("ahead", "Kinderball", now.AddDays(30), "saal")
                        .AddEvent("over", "Altweiber", now.AddDays(-30), "saal")
                )
                .Gallery(gallery =>
                    Photos(gallery)
                        .AddAlbum(
                            "shown",
                            "Prunksitzung",
                            sessionStartYear: 2025,
                            publishedAt: Shown
                        )
                        .AddAlbum("hidden", "Probe", sessionStartYear: 2025)
                        .AddAlbum("empty", "Leer", sessionStartYear: 2025, publishedAt: Shown)
                        .AddGalleryItem("unselected", albumAlias: "empty")
                )
                .News(news =>
                    news.AddNewsPost(
                            "motto",
                            "Motto verkündet",
                            "Vorspann",
                            "Alter Text",
                            NewsCategory.Session,
                            authorAlias: NewsSeeds.Editor,
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
                            "withdrawn",
                            "Zurückgezogen",
                            "Vorspann",
                            "Text",
                            NewsCategory.Club,
                            publishedAt: Proclaimed,
                            slug: "zurueckgezogen",
                            withdrawnAt: Shown
                        )
                        .AddNewsPost(
                            "hidden-tie",
                            "Versteckt",
                            "Vorspann",
                            "Text",
                            NewsCategory.Club,
                            albumAlias: "hidden",
                            publishedAt: Proclaimed,
                            slug: "versteckt"
                        )
                        .AddNewsPost(
                            "empty-tie",
                            "Leer",
                            "Vorspann",
                            "Text",
                            NewsCategory.Club,
                            albumAlias: "empty",
                            publishedAt: Proclaimed,
                            slug: "leer"
                        )
                        .AddNewsPost("article")
                );
    }

    private static GallerySeedBuilder Photos(GallerySeedBuilder gallery) =>
        gallery
            .AddGalleryItem("photo-1", albumAlias: "shown", selectionPosition: 1)
            .AddGalleryItem("photo-2", albumAlias: "shown", selectionPosition: 2)
            .AddGalleryItem("photo-3", albumAlias: "shown", selectionPosition: 3)
            .AddGalleryItem("photo-4", albumAlias: "shown", selectionPosition: 4)
            .AddGalleryItem("photo-5", albumAlias: "shown", selectionPosition: 5)
            .AddGalleryItem("photo-6", albumAlias: "shown", selectionPosition: 6)
            .AddGalleryItem("photo-7", albumAlias: "shown", selectionPosition: 7)
            .AddGalleryItem("photo-8", albumAlias: "shown", selectionPosition: 8)
            .AddGalleryItem("photo-9", albumAlias: "shown", selectionPosition: 9);
}
