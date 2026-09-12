using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Roles;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Roles;

[Collection("Api")]
public sealed class PostRoleHoldingTests
{
    private const string ConflictField = "conflict";
    private const string OpenHoldingMessage = "Diese Person hat diese Rolle bereits inne.";
    private const string OverlappingHoldingMessage =
        "Dieser Zeitraum überschneidet sich mit einer bestehenden Inhaberschaft. "
        + "Eine erneute Inhaberschaft beginnt frühestens am Tag nach dem Ende der vorigen.";
    private const string ArchivedRoleMessage =
        "Eine archivierte Rolle kann nicht bearbeitet werden.";
    private const int UnknownRoleId = 999_999;
    private const int UnknownPersonId = 999_999;

    private static readonly DateOnly HeldSince2017 = new(2017, 9, 1);
    private static readonly DateOnly HandedOver2020 = new(2020, 3, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PostRoleHoldingTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<TestResult<PostRoleHoldingResponse>> AddHolderAsync(
        HttpClient client,
        int roleId,
        int personId,
        DateOnly sinceOn
    ) =>
        client.POSTAsync<PostRoleHolding, PostRoleHoldingRequest, PostRoleHoldingResponse>(
            new PostRoleHoldingRequest
            {
                RoleId = roleId,
                PersonId = personId,
                SinceOn = sinceOn,
            }
        );

    [Fact]
    public async Task Should_OpenTheInhaberschaft_When_AManagerAppointsSomeone()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithFreeRolleAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await AddHolderAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            ctx.Identity.People.IdOf("ilka"),
            HeldSince2017
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.RoleHolding(result.RoleHoldingId)
            .ToHavePeriod(HeldSince2017, null)
            .RoleHoldingsOfPerson(ctx.Identity.People.IdOf("ilka"))
            .ToHaveOpenCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_StoreTheRow_When_TheInhaberschaftStartsInTheFuture()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithFreeRolleAsync(ct);

        var takesOverTomorrow = _fixture.Today.AddDays(1);
        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await AddHolderAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            ctx.Identity.People.IdOf("ilka"),
            takesOverTomorrow
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.RoleHolding(result.RoleHoldingId)
            .ToHavePeriod(takesOverTomorrow, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_OpenASecondInhaberschaft_When_TheReappointmentStartsAfterTheLastOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithHandedOverRolleAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await AddHolderAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            ctx.Identity.People.IdOf("ilka"),
            HandedOver2020.AddDays(1)
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotEqual(ctx.Roles.RoleHoldings.IdOf("ilka-chronik"), result.RoleHoldingId);
        await ctx
            .Expected.RoleHolding(result.RoleHoldingId)
            .ToHavePeriod(HandedOver2020.AddDays(1), null)
            .RoleHoldingsOfPerson(ctx.Identity.People.IdOf("ilka"))
            .ToHaveCount(2)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheReappointmentStartsOnTheDayTheLastOneEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithHandedOverRolleAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await AddHolderAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            ctx.Identity.People.IdOf("ilka"),
            HandedOver2020
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([OverlappingHoldingMessage], failures[ConflictField]);
        await ctx
            .Expected.RoleHoldingsOfPerson(ctx.Identity.People.IdOf("ilka"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_ThePersonAlreadyHoldsTheRolle()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                    .Roles(roles =>
                        roles
                            .AddRole("chronik", "Chronik")
                            .AddRoleHolding("ilka-chronik", "chronik", "ilka", HeldSince2017)
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await AddHolderAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            ctx.Identity.People.IdOf("ilka"),
            HandedOver2020
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([OpenHoldingMessage], failures[ConflictField]);
        await ctx
            .Expected.RoleHoldingsOfPerson(ctx.Identity.People.IdOf("ilka"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheRolleIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                    .Roles(roles =>
                        roles.AddRoleWithDetails(
                            "chronik",
                            "Chronik",
                            "Führt die Vereinschronik.",
                            ArchivedIn2021
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await AddHolderAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            ctx.Identity.People.IdOf("ilka"),
            HeldSince2017
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([ArchivedRoleMessage], failures[ConflictField]);
        await ctx
            .Expected.RoleHoldingsOfPerson(ctx.Identity.People.IdOf("ilka"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheRolleIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithFreeRolleAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await AddHolderAsync(
            client,
            UnknownRoleId,
            ctx.Identity.People.IdOf("ilka"),
            HeldSince2017
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx
            .Expected.RoleHoldingsOfPerson(ctx.Identity.People.IdOf("ilka"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePersonIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithFreeRolleAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await AddHolderAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            UnknownPersonId,
            HeldSince2017
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx.Expected.RoleHoldingsOfPerson(UnknownPersonId).ToHaveCount(0).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheBodyCarriesNoUsablePersonId()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithFreeRolleAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await AddHolderAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            0,
            HeldSince2017
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldRolesManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("ilka", "Ilka", "Reineke").AddAccount("katrin")
                    )
                    .Roles(roles =>
                        roles
                            .AddRole("chronik", "Chronik")
                            .AddRoleWithHolder(
                                "gruppenpflege",
                                "katrin-gruppenpflege",
                                "Gruppenpflege",
                                "katrin",
                                FurriaPermissions.GroupsManage
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("katrin", ct);
        var (response, _) = await AddHolderAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            ctx.Identity.People.IdOf("ilka"),
            HeldSince2017
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.RoleHoldingsOfPerson(ctx.Identity.People.IdOf("ilka"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithFreeRolleAsync(ct);

        var (response, _) = await AddHolderAsync(
            _fixture.CreateClient(),
            ctx.Roles.Roles.IdOf("chronik"),
            ctx.Identity.People.IdOf("ilka"),
            HeldSince2017
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx
            .Expected.RoleHoldingsOfPerson(ctx.Identity.People.IdOf("ilka"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    private Task<SeededContext> BuildWithFreeRolleAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                    .Roles(roles => roles.AddRole("chronik", "Chronik")),
            ct
        );

    private Task<SeededContext> BuildWithHandedOverRolleAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                    .Roles(roles =>
                        roles
                            .AddRole("chronik", "Chronik")
                            .AddRoleHolding(
                                "ilka-chronik",
                                "chronik",
                                "ilka",
                                HeldSince2017,
                                HandedOver2020
                            )
                    ),
            ct
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
