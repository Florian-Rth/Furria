using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.News;
using Furria.Core.News;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.News;

public sealed class PostNewsPostTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Gala = new(2026, 2, 14, 19, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset Shown = new(2026, 2, 20, 9, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public PostNewsPostTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_StartADraftAuthoredByTheWriter_When_SheStartsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(builder => builder.WithNewsEditor(), ct);
        var client = await ctx.Identity.ClientForAsync(NewsSeeds.Editor, ct);

        var (response, result) = await PostAsync(client, Draft("Prunksitzung ausverkauft"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.NewsPost(result.NewsPostId)
            .ToRead("Prunksitzung ausverkauft", "", "", null)
            .NewsPost(result.NewsPostId)
            .ToBeADraft()
            .NewsPost(result.NewsPostId)
            .ToBeAuthoredBy(ctx.Identity.People.IdOf(NewsSeeds.Editor))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_NameNoAuthor_When_TheManagingLoginStartsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, result) = await PostAsync(client, Draft("Ohne Namen"));

        await ctx.Expected.NewsPost(result.NewsPostId).ToBeAuthoredBy(null).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RecordEveryMentionedTargetThatExists_When_TheTextMentionsThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroup("garde", "Stadtgarde")),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var gardeId = ctx.Groups.Groups.IdOf("garde");

        var (_, result) = await PostAsync(
            client,
            Draft(
                "Garde",
                text: $"Die @[Stadtgarde](group:{gardeId}) und @[Niemand](person:999999)"
            )
        );

        await ctx
            .Expected.NewsPost(result.NewsPostId)
            .ToMention(new NewsMention(NewsMentionKind.Group, gardeId))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheDraft_When_TheTextLeavesTheSubset()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (response, _) = await PostAsync(client, Draft("Kursiv", text: "Ein *kursiver* Satz"));

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Should_TieTheEventAndThePublishedAlbum_When_BothAreChosen()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Ties(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var galaId = ctx.Club.Events.IdOf("gala");
        var shownId = ctx.Gallery.Albums.IdOf("shown");

        var (response, result) = await PostAsync(
            client,
            Draft("Rückblick", eventId: galaId, albumId: shownId)
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx.Expected.NewsPost(result.NewsPostId).ToBeTiedTo(galaId, shownId).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheTie_When_TheAlbumIsNotOnTheWebsite()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Ties(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (response, _) = await PostAsync(
            client,
            Draft("Rückblick", albumId: ctx.Gallery.Albums.IdOf("hidden"))
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    private static Task<TestResult<PostNewsPostResponse>> PostAsync(
        HttpClient client,
        PostNewsPostRequest request
    ) => client.POSTAsync<PostNewsPost, PostNewsPostRequest, PostNewsPostResponse>(request);

    private static PostNewsPostRequest Draft(
        string title,
        string text = "",
        int? eventId = null,
        int? albumId = null
    ) =>
        new()
        {
            Title = title,
            Teaser = "",
            Text = text,
            Category = null,
            EventId = eventId,
            AlbumId = albumId,
        };

    private static Action<SeedContextBuilder> Ties() =>
        builder =>
            builder
                .Club(club =>
                    club.AddVenue("saal", "Bürgerhaus")
                        .AddEvent("gala", "Prunksitzung", Gala, "saal")
                )
                .Gallery(gallery =>
                    gallery
                        .AddAlbum(
                            "shown",
                            "Prunksitzung",
                            sessionStartYear: 2025,
                            publishedAt: Shown
                        )
                        .AddAlbum("hidden", "Probe", sessionStartYear: 2025)
                );
}
