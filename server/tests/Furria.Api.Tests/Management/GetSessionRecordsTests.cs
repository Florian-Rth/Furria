using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Management;
using Furria.Api.Media;
using Furria.Core.Media;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Management;

public sealed class GetSessionRecordsTests : IClassFixture<ApiTestFixture>
{
    private const string Motto = "FURRIA — Der Mittelpunkt des Universums";

    private readonly ApiTestFixture _fixture;

    public GetSessionRecordsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReadTheNewestSeasonFirst_When_TheClubHasWrittenSeveralDown()
    {
        var ct = TestContext.Current.CancellationToken;

        var result = await ReadTheRecordsAsAdminAsync(
            builder =>
                builder.Club(club =>
                    club.AddSession("aeltere", 2024)
                        .AddSession("juengste", 2026)
                        .AddSession("mittlere", 2025)
                ),
            ct
        );

        Assert.Equal(
            [2026, 2025, 2024],
            result.Sessions.Select(session => session.StartYear).ToList()
        );
    }

    [Fact]
    public async Task Should_ReadEveryRecordedPart_When_TheClubKnowsTheWholeSeason()
    {
        var ct = TestContext.Current.CancellationToken;

        var result = await ReadTheRecordsAsAdminAsync(
            builder => builder.Club(club => club.AddSession("laufende", 2026, 53, Motto)),
            ct
        );

        var session = Assert.Single(result.Sessions);
        Assert.Equal(2026, session.StartYear);
        Assert.Equal(53, session.Number);
        Assert.Equal(Motto, session.Motto);
    }

    [Fact]
    public async Task Should_ReadTheLogoSourcesAndShape_When_ItsRenditionsAreReady()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddSession("laufende", 2026, 53, Motto)),
            ct
        );
        var sessionId = ctx.Club.Sessions.IdOf("laufende");
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var logoId = await SessionLogoSteps.RenderedAsync(_fixture, client, sessionId, ct);

        var result = await ReadAsync(client);

        var logo = Assert.IsType<SessionLogoEditingDto>(Assert.Single(result.Sessions).Logo);
        Assert.Equal(MediaItemState.Ready, logo.State);
        Assert.False(logo.IsStalled);
        var rendered = Assert.IsType<SessionLogoDto>(logo.Logo);
        Assert.StartsWith(
            _fixture.SignedMediaUrl(logoId, MediaOwner.Session(sessionId), MediaRendition.Large),
            rendered.Picture.LargeUrl
        );
        Assert.Equal(0.8, rendered.Aspect, 6);
    }

    [Fact]
    public async Task Should_ReadTheLogoAsDeveloping_When_ItsRenditionsAreNotReadyYet()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddSession("laufende", 2026)),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        await SessionLogoSteps.UploadAsync(client, ctx.Club.Sessions.IdOf("laufende"), ct);

        var result = await ReadAsync(client);

        var logo = Assert.IsType<SessionLogoEditingDto>(Assert.Single(result.Sessions).Logo);
        Assert.Equal(MediaItemState.Processing, logo.State);
        Assert.Null(logo.Logo);
    }

    [Fact]
    public async Task Should_LeaveTheUnknownPartsEmpty_When_TheEntryOnlyNamesItsYear()
    {
        var ct = TestContext.Current.CancellationToken;

        var result = await ReadTheRecordsAsAdminAsync(
            builder => builder.Club(club => club.AddSession("nur-jahr", 1974)),
            ct
        );

        var session = Assert.Single(result.Sessions);
        Assert.Equal(1974, session.StartYear);
        Assert.Null(session.Number);
        Assert.Null(session.Motto);
        Assert.Null(session.Logo);
    }

    [Fact]
    public async Task Should_ReadAnEmptyChronicle_When_TheClubHasWrittenNothingDown()
    {
        var ct = TestContext.Current.CancellationToken;

        var result = await ReadTheRecordsAsAdminAsync(_ => { }, ct);

        Assert.Empty(result.Sessions);
    }

    private async Task<GetSessionRecordsResponse> ReadTheRecordsAsAdminAsync(
        Action<SeedContextBuilder> arrange,
        CancellationToken ct
    )
    {
        var ctx = await _fixture.BuildAsync(arrange, ct);

        return await ReadAsync(await ctx.Identity.ManagingLoginClientAsync(ct));
    }

    private static async Task<GetSessionRecordsResponse> ReadAsync(HttpClient client)
    {
        var (response, result) = await client.GETAsync<
            GetSessionRecords,
            GetSessionRecordsResponse
        >();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result;
    }
}
