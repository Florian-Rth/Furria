using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Keys;
using Furria.Api.Endpoints.Persons;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Keys;

[Collection("Api")]
public sealed class PostKeyHoldingTests
{
    private const string ConflictField = "conflict";
    private const string ValidationField = "request";
    private const int UnknownVenueId = 999_999;
    private const int UnknownPersonId = 999_998;

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);
    private static readonly DateOnly HeldSince2019 = new(2019, 2, 1);
    private static readonly DateOnly HeldSince2024 = new(2024, 3, 1);
    private static readonly DateOnly ReturnedIn2022 = new(2022, 6, 30);

    private readonly ApiTestFixture _fixture;

    public PostKeyHoldingTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RecordAnOpenKey_When_TheKeyIsHandedOut()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("anna", "Anna", "Kaiser"))
                    .Club(club => club.AddVenue("lager", "Requisitenlager")),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.POSTAsync<
            PostKeyHolding,
            PostKeyHoldingRequest,
            PostKeyHoldingResponse
        >(
            new()
            {
                VenueId = ctx.Club.Venues.IdOf("lager"),
                PersonId = ctx.Identity.People.IdOf("anna"),
                SinceOn = HeldSince2024,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.KeyHolding(result.KeyHoldingId)
            .ToBeHeldAt(ctx.Club.Venues.IdOf("lager"))
            .KeyHolding(result.KeyHoldingId)
            .ToBeHeldBy(ctx.Identity.People.IdOf("anna"))
            .KeyHolding(result.KeyHoldingId)
            .ToHavePeriod(HeldSince2024, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnValidationNamingTheVenue_When_TheVenueIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("anna", "Anna", "Kaiser"))
                    .Club(club =>
                        club.AddVenue("altes-lager", "Altes Lager", archivedOn: ArchivedIn2021)
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await client.POSTAsync<
            PostKeyHolding,
            PostKeyHoldingRequest,
            PostKeyHoldingResponse
        >(
            new()
            {
                VenueId = ctx.Club.Venues.IdOf("altes-lager"),
                PersonId = ctx.Identity.People.IdOf("anna"),
                SinceOn = HeldSince2024,
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Contains("Altes Lager", Assert.Single(failures[ValidationField]));
        await ctx
            .Expected.KeyHoldingsOfVenue(ctx.Club.Venues.IdOf("altes-lager"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_ThePersonAlreadyHoldsOneForThisVenue()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("anna", "Anna", "Kaiser"))
                    .Club(club =>
                        club.AddVenue("lager", "Requisitenlager")
                            .AddKeyHolding("anna-lager", "lager", "anna", HeldSince2019)
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await client.POSTAsync<
            PostKeyHolding,
            PostKeyHoldingRequest,
            PostKeyHoldingResponse
        >(
            new()
            {
                VenueId = ctx.Club.Venues.IdOf("lager"),
                PersonId = ctx.Identity.People.IdOf("anna"),
                SinceOn = HeldSince2024,
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Single((await ReadFailuresAsync(response, ct))[ConflictField]);
        await ctx
            .Expected.KeyHoldingsOfVenue(ctx.Club.Venues.IdOf("lager"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RecordAnotherKey_When_ThePreviousOneWasReturned()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("anna", "Anna", "Kaiser"))
                    .Club(club =>
                        club.AddVenue("lager", "Requisitenlager")
                            .AddKeyHolding(
                                "anna-lager",
                                "lager",
                                "anna",
                                HeldSince2019,
                                ReturnedIn2022
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.POSTAsync<
            PostKeyHolding,
            PostKeyHoldingRequest,
            PostKeyHoldingResponse
        >(
            new()
            {
                VenueId = ctx.Club.Venues.IdOf("lager"),
                PersonId = ctx.Identity.People.IdOf("anna"),
                SinceOn = HeldSince2024,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.KeyHolding(result.KeyHoldingId)
            .ToBeOpen()
            .KeyHolding(ctx.Club.KeyHoldings.IdOf("anna-lager"))
            .ToHavePeriod(HeldSince2019, ReturnedIn2022)
            .KeyHoldingsOfVenue(ctx.Club.Venues.IdOf("lager"))
            .ToHaveCount(2)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheVenueDoesNotExist()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddPerson("anna", "Anna", "Kaiser")),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await client.POSTAsync<
            PostKeyHolding,
            PostKeyHoldingRequest,
            PostKeyHoldingResponse
        >(
            new()
            {
                VenueId = UnknownVenueId,
                PersonId = ctx.Identity.People.IdOf("anna"),
                SinceOn = HeldSince2024,
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePersonIsNotInTheRegister()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddVenue("lager", "Requisitenlager")),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await client.POSTAsync<
            PostKeyHolding,
            PostKeyHoldingRequest,
            PostKeyHoldingResponse
        >(
            new()
            {
                VenueId = ctx.Club.Venues.IdOf("lager"),
                PersonId = UnknownPersonId,
                SinceOn = HeldSince2024,
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_FindThePersonAndGiveHerTheKey_When_TheCallerOnlyHoldsKeyHoldingsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("anna")
                            .AddPerson("paula", "Paula", "Brendel")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "schluesselpflege",
                            "schluesselpflege-holding",
                            "Schlüsselpflege",
                            "anna",
                            FurriaPermissions.KeyHoldingsManage
                        )
                    )
                    .Club(club => club.AddVenue("lager", "Requisitenlager")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (searchResponse, searchResult) = await client.GETAsync<
            GetPersonSearch,
            GetPersonSearchRequest,
            GetPersonSearchResponse
        >(new GetPersonSearchRequest { Query = "bren" });

        Assert.Equal(HttpStatusCode.OK, searchResponse.StatusCode);
        var paula = Assert.Single(searchResult.Persons);
        Assert.Equal(ctx.Identity.People.IdOf("paula"), paula.PersonId);

        var (response, result) = await client.POSTAsync<
            PostKeyHolding,
            PostKeyHoldingRequest,
            PostKeyHoldingResponse
        >(
            new()
            {
                VenueId = ctx.Club.Venues.IdOf("lager"),
                PersonId = paula.PersonId,
                SinceOn = HeldSince2024,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.KeyHolding(result.KeyHoldingId)
            .ToBeHeldBy(ctx.Identity.People.IdOf("paula"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldKeyHoldingsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("anna", "Anna", "Kaiser").AddAccount("anna")
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
                    .Club(club => club.AddVenue("lager", "Requisitenlager")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, _) = await client.POSTAsync<
            PostKeyHolding,
            PostKeyHoldingRequest,
            PostKeyHoldingResponse
        >(
            new()
            {
                VenueId = ctx.Club.Venues.IdOf("lager"),
                PersonId = ctx.Identity.People.IdOf("anna"),
                SinceOn = HeldSince2024,
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
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
