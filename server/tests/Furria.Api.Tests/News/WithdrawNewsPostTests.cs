using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.News;
using Furria.Core.News;
using Furria.Core.Text;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.News;

public sealed class WithdrawNewsPostTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Proclaimed = new(2025, 11, 11, 11, 11, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public WithdrawNewsPostTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_MakeThePendingChangesThePostsText_When_APostWithPendingChangesIsWithdrawn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var editedId = ctx.News.Posts.IdOf("edited");
        var gardeId = ctx.Groups.Groups.IdOf("garde");

        await WithdrawAsync(client, editedId);

        await ctx
            .Expected.NewsPost(editedId)
            .ToRead(
                "Korrigiert",
                "Neuer Vorspann",
                $"Mit der @[Garde](group:{gardeId})",
                NewsCategory.Groups
            )
            .NewsPost(editedId)
            .ToHaveNoPendingChanges()
            .NewsPost(editedId)
            .ToMention(new Mention(MentionKind.Group, gardeId))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseToWithdraw_When_ThePostIsADraft()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Posts(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await WithdrawAsync(client, ctx.News.Posts.IdOf("draft"));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    private static Task<HttpResponseMessage> WithdrawAsync(HttpClient client, int newsPostId) =>
        client.DELETEAsync<WithdrawNewsPost, WithdrawNewsPostRequest>(
            new() { NewsPostId = newsPostId }
        );

    private static Action<SeedContextBuilder> Posts() =>
        builder =>
            builder
                .Groups(groups => groups.AddGroup("garde", "Stadtgarde"))
                .News(news =>
                    news.AddNewsPost("draft", "Entwurf", "Vorspann", "Text", NewsCategory.Club)
                        .AddNewsPost(
                            "live",
                            "Das Motto steht",
                            "Vorspann",
                            "Text",
                            NewsCategory.Session,
                            publishedAt: Proclaimed
                        )
                        .AddNewsPost(
                            "edited",
                            "Gardetanz",
                            "Vorspann",
                            "Text",
                            NewsCategory.Groups,
                            publishedAt: Proclaimed
                        )
                        .AddPendingChanges(
                            "edited",
                            "Korrigiert",
                            "Neuer Vorspann",
                            "Mit der @[Garde](group:{garde})",
                            NewsCategory.Groups
                        )
                );
}
