using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Management;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Management;

[Collection("Api")]
public sealed class GetSessionRecordsTests
{
    private const string Motto = "FURRIA — Der Mittelpunkt des Universums";
    private const string Logo =
        "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 10 10\">"
        + "<circle cx=\"5\" cy=\"5\" r=\"4\" />"
        + "</svg>";

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
            builder => builder.Club(club => club.AddSession("laufende", 2026, 53, Motto, Logo)),
            ct
        );

        var session = Assert.Single(result.Sessions);
        Assert.Equal(2026, session.StartYear);
        Assert.Equal(53, session.Number);
        Assert.Equal(Motto, session.Motto);
        Assert.Equal(Logo, session.LogoSvg);
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
        Assert.Null(session.LogoSvg);
    }

    [Fact]
    public async Task Should_ReadAnEmptyChronicle_When_TheClubHasWrittenNothingDown()
    {
        var ct = TestContext.Current.CancellationToken;

        var result = await ReadTheRecordsAsAdminAsync(_ => { }, ct);

        Assert.Empty(result.Sessions);
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
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.GETAsync<GetSessionRecords, GetSessionRecordsResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    private async Task<GetSessionRecordsResponse> ReadTheRecordsAsAdminAsync(
        Action<SeedContextBuilder> arrange,
        CancellationToken ct
    )
    {
        var ctx = await _fixture.BuildAsync(arrange, ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<
            GetSessionRecords,
            GetSessionRecordsResponse
        >();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result;
    }
}
