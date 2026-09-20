using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Management;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Management;

[Collection("Api")]
public sealed class PutSessionRecordTests
{
    private const int UnknownSessionId = 999_999;
    private const string ConflictField = "conflict";
    private const string ValidationField = "request";
    private const string DuplicateStartYearMessage =
        "Für diese Session gibt es schon einen Eintrag.";
    private const string UnreadableLogoMessage = "Dieses Sessionslogo ist keine lesbare SVG-Datei.";
    private const string Motto = "FURRIA — Der Mittelpunkt des Universums";
    private const string WrongMotto = "Vom Festzelt ins All";
    private const string Logo =
        "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 10 10\">"
        + "<circle cx=\"5\" cy=\"5\" r=\"4\" />"
        + "</svg>";
    private const string LogoCarryingAScript =
        "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 10 10\">"
        + "<script>alert(1)</script>"
        + "<circle cx=\"5\" cy=\"5\" r=\"4\" />"
        + "</svg>";
    private const string TornArtwork = "<svg><circle r=\"4\"></svg>";

    private readonly ApiTestFixture _fixture;

    public PutSessionRecordTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_WriteDownTheNummer_When_TheEvidenceTurnsUpLater()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddSession("laufende", 2026, motto: Motto)),
            ct
        );
        var sessionId = ctx.Club.Sessions.IdOf("laufende");

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await EditAsync(client, sessionId, 2026, 53, Motto, null);

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

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await EditAsync(client, sessionId, 2026, 53, null, null);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx.Expected.Session(sessionId).ToHaveMotto(null).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_StoreTheArtworkWithoutTheScript_When_TheLogoCarriesOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddSession("laufende", 2026)),
            ct
        );
        var sessionId = ctx.Club.Sessions.IdOf("laufende");

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await EditAsync(client, sessionId, 2026, null, null, LogoCarryingAScript);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx.Expected.Session(sessionId).ToHaveLogo(Logo).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheEintragAsItWas_When_TheLogoIsNotReadableArtwork()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddSession("laufende", 2026, 53, Motto)),
            ct
        );
        var sessionId = ctx.Club.Sessions.IdOf("laufende");

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await EditAsync(client, sessionId, 2026, 53, WrongMotto, TornArtwork);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([UnreadableLogoMessage], failures[ValidationField]);
        await ctx
            .Expected.Session(sessionId)
            .ToHaveMotto(Motto)
            .Session(sessionId)
            .ToHaveLogo(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheSeasonAlreadyCarriesAnotherEintrag()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club => club.AddSession("vorige", 2025).AddSession("laufende", 2026)),
            ct
        );
        var sessionId = ctx.Club.Sessions.IdOf("laufende");

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await EditAsync(client, sessionId, 2025, null, null, null);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([DuplicateStartYearMessage], failures[ConflictField]);
        await ctx.Expected.Session(sessionId).ToHaveStartYear(2026).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheEintragIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await EditAsync(client, UnknownSessionId, 2026, null, Motto, null);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldClubManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("ilka"))
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "gruppenpflege",
                            "ilka-gruppenpflege",
                            "Gruppenpflege",
                            "ilka",
                            FurriaPermissions.GroupsManage
                        )
                    )
                    .Club(club => club.AddSession("laufende", 2026)),
            ct
        );
        var sessionId = ctx.Club.Sessions.IdOf("laufende");

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var response = await EditAsync(client, sessionId, 2026, 53, Motto, null);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx.Expected.Session(sessionId).ToHaveNumber(null).AssertAsync(ct);
    }

    private static Task<HttpResponseMessage> EditAsync(
        HttpClient client,
        int sessionId,
        int startYear,
        int? number,
        string? motto,
        string? logoSvg
    ) =>
        client.PUTAsync<PutSessionRecord, PutSessionRecordRequest>(
            new PutSessionRecordRequest
            {
                SessionId = sessionId,
                StartYear = startYear,
                Number = number,
                Motto = motto,
                LogoSvg = logoSvg,
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
