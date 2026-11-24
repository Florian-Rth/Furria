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

    private static Action<SeedContextBuilder> Posts() =>
        builder =>
            builder
                .WithNewsEditor()
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
