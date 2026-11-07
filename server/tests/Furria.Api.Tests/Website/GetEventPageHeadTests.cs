using System.Net;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Website.WebsitePageHeadSteps;

namespace Furria.Api.Tests.Website;

public sealed class GetEventPageHeadTests : IClassFixture<ApiTestFixture>
{
    private const string Kind = "events";

    private static readonly DateTimeOffset Now = new(2027, 1, 10, 12, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset AtTheGala = new(2027, 1, 16, 18, 11, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public GetEventPageHeadTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_NameTheCanonicalAddress_When_TheEventIsAskedForUnderAnOldSlug()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await _fixture.BuildAsync(Club(), ct);
                var eventId = ctx.Club.Events.IdOf("gala");

                var (status, html) = await PageHeadAsync(_fixture, Kind, $"{eventId}-alter-titel");

                Assert.Equal(HttpStatusCode.OK, status);
                var canonical = $"{Origin}/events/{eventId}-1-prunksitzung";
                Assert.Contains(
                    $"<link data-page-head rel=\"canonical\" href=\"{canonical}\">",
                    html
                );
                Assert.Contains(Meta("og:url", canonical), html);
                Assert.Contains(
                    "<title data-page-head>1. Prunksitzung 2026/27 · FURRIA</title>",
                    html
                );
                Assert.Contains(Meta("og:description", "Garde &amp; Bütt"), html);
                Assert.Contains(Meta("og:type", "website"), html);
            }
        );
    }

    [Theory]
    [InlineData("hidden")]
    [InlineData("unaddressable")]
    public async Task Should_AnswerAnEmptyNotFound_When_TheEventIsNotOnTheWebsite(string which)
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await _fixture.BuildAsync(Club(), ct);
                var slug = which == "hidden" ? $"{ctx.Club.Events.IdOf("hidden")}-probe" : "probe";

                var (status, html) = await PageHeadAsync(_fixture, Kind, slug);

                Assert.Equal(HttpStatusCode.NotFound, status);
                Assert.Empty(html);
            }
        );
    }

    private static Action<SeedContextBuilder> Club() =>
        builder =>
            builder.Club(club =>
                club.AddVenue("saal", "Bürgerhaus")
                    .AddEvent("gala", "1. Prunksitzung", AtTheGala, "saal", teaser: "Garde & Bütt")
                    .AddEvent("hidden", "Probe", AtTheGala, "saal", unpublished: true)
            );
}
