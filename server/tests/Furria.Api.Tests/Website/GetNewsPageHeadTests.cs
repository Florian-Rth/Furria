using System.Net;
using Furria.Core.News;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Website.WebsitePageHeadSteps;

namespace Furria.Api.Tests.Website;

public sealed class GetNewsPageHeadTests : IClassFixture<ApiTestFixture>
{
    private const string Kind = "news";

    private static readonly DateTimeOffset Proclaimed = new(2025, 11, 11, 10, 11, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset Withdrawn = new(2026, 2, 20, 9, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public GetNewsPageHeadTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_DescribeAnArticleWithItsBerlinPublishingTime_When_ThePostIsLive()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(News(), ct);

        var (status, html) = await PageHeadAsync(_fixture, Kind, "motto-verkuendet");

        Assert.Equal(HttpStatusCode.OK, status);
        Assert.Contains("<title data-page-head>Motto verkündet · FURRIA</title>", html);
        Assert.Contains(
            "<meta data-page-head name=\"description\" content=\"&quot;Hau rein&quot;\">",
            html
        );
        Assert.Contains(Meta("og:url", $"{Origin}/news/motto-verkuendet"), html);
        Assert.Contains(Meta("og:type", "article"), html);
        Assert.Contains(Meta("article:published_time", "2025-11-11T11:11:00+01:00"), html);
    }

    [Fact]
    public async Task Should_AnswerAnEmptyNotFound_When_ThePostWasWithdrawn()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(News(), ct);

        var (status, html) = await PageHeadAsync(_fixture, Kind, "zurueckgezogen");

        Assert.Equal(HttpStatusCode.NotFound, status);
        Assert.Empty(html);
    }

    private static Action<SeedContextBuilder> News() =>
        builder =>
            builder.News(news =>
                news.AddNewsPost(
                        "motto",
                        "Motto verkündet",
                        "\"Hau rein\"",
                        "Text",
                        NewsCategory.Session,
                        publishedAt: Proclaimed,
                        slug: "motto-verkuendet"
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
