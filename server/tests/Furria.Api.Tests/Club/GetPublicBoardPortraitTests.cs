using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Club;
using Furria.Api.Tests.Media;
using Furria.Core.Media;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class GetPublicBoardPortraitTests : IClassFixture<ApiTestFixture>
{
    private static readonly byte[] SmallRendition = [1, 2, 3, 4, 5, 6, 7, 8];
    private static readonly DateOnly SeatedIn2023 = new(2023, 11, 11);

    private readonly ApiTestFixture _fixture;

    public GetPublicBoardPortraitTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ServeThePortraitUncachedByTheEdge_When_ItsHolderSitsInAPublicOffice()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await SeatNadineAsync(isPublic: true, untilOn: null, ct);
        await RenderNadinesPortraitAsync(ctx, ct);

        var response = await _fixture.CreateClient().GetAsync(await SmallPortraitUrlAsync(), ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(SmallRendition, await response.Content.ReadAsByteArrayAsync(ct));
        Assert.True(response.Headers.CacheControl?.Private);
        Assert.True(response.Headers.CacheControl?.NoCache);
    }

    [Fact]
    public async Task Should_ServeTheRequestedRange_When_ARangeIsAsked()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await SeatNadineAsync(isPublic: true, untilOn: null, ct);
        await RenderNadinesPortraitAsync(ctx, ct);
        var request = new HttpRequestMessage(HttpMethod.Get, await SmallPortraitUrlAsync());
        request.Headers.Range = new System.Net.Http.Headers.RangeHeaderValue(2, 4);

        var response = await _fixture.CreateClient().SendAsync(request, ct);

        Assert.Equal(HttpStatusCode.PartialContent, response.StatusCode);
        Assert.Equal(SmallRendition[2..5], await response.Content.ReadAsByteArrayAsync(ct));
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_ItsHolderHasLeftThePublicOffice()
    {
        var ct = TestContext.Current.CancellationToken;
        var today = DateOnly.FromDateTime(_fixture.TimeProvider.GetUtcNow().UtcDateTime);
        var ctx = await SeatNadineAsync(isPublic: true, untilOn: today, ct);
        await RenderNadinesPortraitAsync(ctx, ct);
        var url = await SmallPortraitUrlAsync();

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromDays(2),
            async () =>
            {
                var response = await _fixture.CreateClient().GetAsync(url, ct);

                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        );
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_TheUncroppedRenditionIsAsked()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await SeatNadineAsync(isPublic: true, untilOn: null, ct);
        var portraitId = await RenderNadinesPortraitAsync(ctx, ct);
        await _fixture.PlaceRenditionAsync(portraitId, MediaRendition.Uncropped, [9, 9], ct);
        var url = await SmallPortraitUrlAsync();

        var response = await _fixture
            .CreateClient()
            .GetAsync(url.Replace("/small?", "/uncropped?", StringComparison.Ordinal), ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private Task<SeededContext> SeatNadineAsync(
        bool isPublic,
        DateOnly? untilOn,
        CancellationToken ct
    ) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("nadine", "Nadine", "Wolters"))
                    .Club(club =>
                        club.AddBoardOffice("praesident", "Präsident", 1, isPublic: isPublic)
                            .AddBoardSeat("nadine-p", "praesident", "nadine", SeatedIn2023, untilOn)
                    ),
            ct
        );

    private async Task<int> RenderNadinesPortraitAsync(SeededContext ctx, CancellationToken ct)
    {
        var portraitId = await PictureSteps.RenderedPortraitAsync(
            _fixture,
            await ctx.Identity.ManagingLoginClientAsync(ct),
            ctx.Identity.People.IdOf("nadine"),
            ct
        );
        await _fixture.PlaceRenditionAsync(portraitId, MediaRendition.Small, SmallRendition, ct);
        return portraitId;
    }

    private async Task<string> SmallPortraitUrlAsync()
    {
        var (_, board) = await _fixture
            .CreateClient()
            .GETAsync<GetPublicBoard, GetPublicBoardResponse>();
        return Assert.Single(board.Seats).Portrait!.SmallUrl;
    }
}
