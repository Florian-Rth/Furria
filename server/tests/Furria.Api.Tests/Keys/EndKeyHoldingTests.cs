using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Keys;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Keys;

[Collection("Api")]
public sealed class EndKeyHoldingTests
{
    private const string ConflictField = "conflict";
    private const string ValidationField = "request";
    private const int UnknownKeyHoldingId = 999_999;

    private static readonly DateOnly HeldSince2019 = new(2019, 2, 1);
    private static readonly DateOnly HeldSince2024 = new(2024, 3, 1);
    private static readonly DateOnly ReturnedIn2022 = new(2022, 6, 30);
    private static readonly DateOnly ReturnedIn2025 = new(2025, 5, 14);
    private static readonly DateOnly BeforeTheHandout = new(2018, 12, 24);

    private readonly ApiTestFixture _fixture;

    public EndKeyHoldingTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_StampDenRueckgabetag_When_DerSchluesselZurueckgenommenWird()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("maik", "Maik", "Perlberg"))
                    .Club(club =>
                        club.AddVenue("lager", "Requisitenlager")
                            .AddKeyHolding("maik-lager", "lager", "maik", HeldSince2019)
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.POSTAsync<EndKeyHolding, EndKeyHoldingRequest>(
            new()
            {
                KeyHoldingId = ctx.Club.KeyHoldings.IdOf("maik-lager"),
                UntilOn = ReturnedIn2025,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.KeyHolding(ctx.Club.KeyHoldings.IdOf("maik-lager"))
            .ToHavePeriod(HeldSince2019, ReturnedIn2025)
            .KeyHoldingsOfVenue(ctx.Club.Venues.IdOf("lager"))
            .ToHaveOpenCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnValidation_When_DieRueckgabeVorDerAusgabeLiegt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("maik", "Maik", "Perlberg"))
                    .Club(club =>
                        club.AddVenue("lager", "Requisitenlager")
                            .AddKeyHolding("maik-lager", "lager", "maik", HeldSince2019)
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.POSTAsync<EndKeyHolding, EndKeyHoldingRequest>(
            new()
            {
                KeyHoldingId = ctx.Club.KeyHoldings.IdOf("maik-lager"),
                UntilOn = BeforeTheHandout,
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        Assert.Single((await ReadFailuresAsync(response, ct))[ValidationField]);
        await ctx
            .Expected.KeyHolding(ctx.Club.KeyHoldings.IdOf("maik-lager"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_DerSchluesselSchonZurueckIst()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("maik", "Maik", "Perlberg"))
                    .Club(club =>
                        club.AddVenue("lager", "Requisitenlager")
                            .AddKeyHolding(
                                "maik-lager",
                                "lager",
                                "maik",
                                HeldSince2019,
                                ReturnedIn2022
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.POSTAsync<EndKeyHolding, EndKeyHoldingRequest>(
            new()
            {
                KeyHoldingId = ctx.Club.KeyHoldings.IdOf("maik-lager"),
                UntilOn = ReturnedIn2025,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Single((await ReadFailuresAsync(response, ct))[ConflictField]);
        await ctx
            .Expected.KeyHolding(ctx.Club.KeyHoldings.IdOf("maik-lager"))
            .ToHavePeriod(HeldSince2019, ReturnedIn2022)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_DenSchluesselNichtGibt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await client.POSTAsync<EndKeyHolding, EndKeyHoldingRequest>(
            new() { KeyHoldingId = UnknownKeyHoldingId, UntilOn = ReturnedIn2025 }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldKeyHoldingsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("anna")
                            .AddPerson("maik", "Maik", "Perlberg")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "ortspflege",
                            "ortspflege-holding",
                            "Ortspflege",
                            "anna",
                            FurriaPermissions.ClubManage
                        )
                    )
                    .Club(club =>
                        club.AddVenue("lager", "Requisitenlager")
                            .AddKeyHolding("maik-lager", "lager", "maik", HeldSince2024)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var response = await client.POSTAsync<EndKeyHolding, EndKeyHoldingRequest>(
            new()
            {
                KeyHoldingId = ctx.Club.KeyHoldings.IdOf("maik-lager"),
                UntilOn = ReturnedIn2025,
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.KeyHolding(ctx.Club.KeyHoldings.IdOf("maik-lager"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("maik", "Maik", "Perlberg"))
                    .Club(club =>
                        club.AddVenue("lager", "Requisitenlager")
                            .AddKeyHolding("maik-lager", "lager", "maik", HeldSince2024)
                    ),
            ct
        );

        var response = await _fixture
            .CreateClient()
            .POSTAsync<EndKeyHolding, EndKeyHoldingRequest>(
                new()
                {
                    KeyHoldingId = ctx.Club.KeyHoldings.IdOf("maik-lager"),
                    UntilOn = ReturnedIn2025,
                }
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

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
