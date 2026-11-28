using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Studio.SongReplacementSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class GetActSongReplacementTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetActSongReplacementTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_OfferTheNeighbouringSong_When_TheNewFileIsTheFinalMix()
    {
        var ct = TestContext.Current.CancellationToken;
        var mix = await MarchAndPolkaAsync(_fixture, ct);
        var finalMix = await AnalysedFileAsync(_fixture, mix.Admin, mix.ActId, FinalMix, ct);

        var (response, result) = await MatchAsync(mix, mix.March.SongId, finalMix);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [mix.March.SongId, mix.Polka.SongId],
            result.Songs.Select(song => song.SongId)
        );
        Assert.Equal(5, result.Songs[0].StartSeconds, 0.1);
        Assert.Equal(45, result.Songs[1].StartSeconds, 0.1);
        Assert.Equal(85, result.Songs[1].EndSeconds, 0.1);
    }

    [Fact]
    public async Task Should_FindNoSong_When_TheNewFileHoldsOtherMusic()
    {
        var ct = TestContext.Current.CancellationToken;
        var mix = await MarchAndPolkaAsync(_fixture, ct);
        var waltz = await AnalysedFileAsync(_fixture, mix.Admin, mix.ActId, Waltz, ct);

        var (response, result) = await MatchAsync(mix, mix.March.SongId, waltz);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(result.Songs);
    }

    private static Task<TestResult<GetActSongReplacementResponse>> MatchAsync(
        MarchAndPolka mix,
        int songId,
        int mediaItemId
    ) =>
        mix.Admin.GETAsync<
            GetActSongReplacement,
            GetActSongReplacementRequest,
            GetActSongReplacementResponse
        >(
            new()
            {
                ActId = mix.ActId,
                SongId = songId,
                MediaItemId = mediaItemId,
            }
        );
}
