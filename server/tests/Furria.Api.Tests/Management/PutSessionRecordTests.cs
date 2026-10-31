using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Management;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Management;

public sealed class PutSessionRecordTests : IClassFixture<ApiTestFixture>
{
    private const int UnknownSessionId = 999_999;
    private const string ConflictField = "conflict";
    private const string DuplicateStartYearMessage =
        "Für diese Session gibt es schon einen Eintrag.";
    private const string Motto = "FURRIA — Der Mittelpunkt des Universums";
    private const string WrongMotto = "Vom Festzelt ins All";

    private readonly ApiTestFixture _fixture;

    public PutSessionRecordTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_WriteDownTheNumber_When_TheEvidenceTurnsUpLater()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddSession("laufende", 2026, motto: Motto)),
            ct
        );
        var sessionId = ctx.Club.Sessions.IdOf("laufende");

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await EditAsync(client, sessionId, 2026, 53, Motto);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Session(sessionId)
            .ToHaveNumber(53)
            .Session(sessionId)
            .ToHaveMotto(Motto)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ForgetTheMotto_When_ItWasEnteredWrongly()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddSession("laufende", 2026, 53, WrongMotto)),
            ct
        );
        var sessionId = ctx.Club.Sessions.IdOf("laufende");

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await EditAsync(client, sessionId, 2026, 53, null);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx.Expected.Session(sessionId).ToHaveMotto(null).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheLogo_When_TheRestOfTheRecordIsEdited()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddSession("laufende", 2026, 53, WrongMotto)),
            ct
        );
        var sessionId = ctx.Club.Sessions.IdOf("laufende");
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var logoId = await SessionLogoSteps.UploadAsync(client, sessionId, ct);

        var response = await EditAsync(client, sessionId, 2026, 53, Motto);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Session(sessionId)
            .ToHaveMotto(Motto)
            .Session(sessionId)
            .ToShowLogo(logoId)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheSeasonAlreadyCarriesAnotherEntry()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club => club.AddSession("vorige", 2025).AddSession("laufende", 2026)),
            ct
        );
        var sessionId = ctx.Club.Sessions.IdOf("laufende");

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await EditAsync(client, sessionId, 2025, null, null);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([DuplicateStartYearMessage], failures[ConflictField]);
        await ctx.Expected.Session(sessionId).ToHaveStartYear(2026).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheEntryIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await EditAsync(client, UnknownSessionId, 2026, null, Motto);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static Task<HttpResponseMessage> EditAsync(
        HttpClient client,
        int sessionId,
        int startYear,
        int? number,
        string? motto
    ) =>
        client.PUTAsync<PutSessionRecord, PutSessionRecordRequest>(
            new PutSessionRecordRequest
            {
                SessionId = sessionId,
                StartYear = startYear,
                Number = number,
                Motto = motto,
            }
        );

    private static async Task<IDictionary<string, List<string>>> ReadFailuresAsync(
        HttpResponseMessage response,
        CancellationToken ct
    )
    {
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        return payload?.Errors
            ?? throw new InvalidOperationException("The failure response carried no errors.");
    }
}
