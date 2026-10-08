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
public sealed class RestoreRoleTests
{
    private const string ConflictField = "conflict";
    private const string NotArchivedMessage = "Diese Rolle ist nicht archiviert.";
    private const string DuplicateNameMessage = "Eine Rolle mit diesem Namen gibt es schon.";

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public RestoreRoleTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<HttpResponseMessage> RestoreRoleAsync(HttpClient client, int roleId) =>
        client.POSTAsync<RestoreRole, RestoreRoleRequest>(
            new RestoreRoleRequest { RoleId = roleId }
        );

    [Fact]
    public async Task Should_ClearTheArchiveStamp_When_AManagerReactivatesTheRole()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithArchivedChronicleAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await RestoreRoleAsync(client, ctx.Roles.Roles.IdOf("chronik"));

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Role(ctx.Roles.Roles.IdOf("chronik"))
            .ToBeArchivedOn(null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LiftTheArchiveOfEveryoneWhoseHoldingRunsAgain_When_TheRoleIsRestored()
    {
        var ct = TestContext.Current.CancellationToken;
        var heldSince2015 = new DateOnly(2015, 9, 1);
        var handedOver2019 = new DateOnly(2019, 6, 30);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddArchive("paula", ArchivedIn2021)
                            .AddPerson("anna", "Anna", "Vogt")
                            .AddArchive("anna", ArchivedIn2021)
                    )
                    .Roles(roles =>
                        roles
                            .AddRoleWithDetails("chronik", "Chronik", "", ArchivedIn2021)
                            .AddRoleHolding("paula-chronik", "chronik", "paula", heldSince2015)
                            .AddRoleHolding(
                                "anna-chronik",
                                "chronik",
                                "anna",
                                heldSince2015,
                                handedOver2019
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await RestoreRoleAsync(client, ctx.Roles.Roles.IdOf("chronik"));

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToNotBeArchived()
            .Person(ctx.Identity.People.IdOf("anna"))
            .ToBeArchived(ArchivedIn2021, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_GrantItsKeysAgain_When_TheRoleIsReactivated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("ilka"))
                    .Roles(roles =>
                        roles
                            .AddRoleWithDetails(
                                "rollenpflege",
                                "Rollenpflege",
                                "Pflegt die Rollen.",
                                ArchivedIn2021,
                                FurriaPermissions.RolesManage
                            )
                            .AddRoleHolding("ilka-rollenpflege", "rollenpflege", "ilka")
                    ),
            ct
        );

        var ilka = await ctx.Identity.ClientForAsync("ilka", ct);
        var (denied, _) = await ilka.GETAsync<GetRoles, GetRolesResponse>();
        Assert.Equal(HttpStatusCode.Forbidden, denied.StatusCode);

        var admin = await ctx.Identity.ManagingLoginClientAsync(ct);
        var restored = await RestoreRoleAsync(admin, ctx.Roles.Roles.IdOf("rollenpflege"));
        Assert.Equal(HttpStatusCode.NoContent, restored.StatusCode);

        var (afterwards, _) = await ilka.GETAsync<GetRoles, GetRolesResponse>();
        Assert.Equal(HttpStatusCode.OK, afterwards.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheRoleIsNotArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Roles(roles => roles.AddRole("chronik", "Chronik")),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await RestoreRoleAsync(client, ctx.Roles.Roles.IdOf("chronik"));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([NotArchivedMessage], failures[ConflictField]);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_AnActiveRoleNowCarriesTheName()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Roles(roles =>
                    roles
                        .AddRoleWithDetails(
                            "chronik-retired",
                            "Chronik",
                            "Die alte Rolle.",
                            ArchivedIn2021
                        )
                        .AddRole("chronik", "chronik")
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await RestoreRoleAsync(client, ctx.Roles.Roles.IdOf("chronik-retired"));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([DuplicateNameMessage], failures[ConflictField]);
        await ctx
            .Expected.Role(ctx.Roles.Roles.IdOf("chronik-retired"))
            .ToBeArchivedOn(ArchivedIn2021)
            .AssertAsync(ct);
    }

    private Task<SeededContext> BuildWithArchivedChronicleAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder.Roles(roles =>
                    roles.AddRoleWithDetails(
                        "chronik",
                        "Chronik",
                        "Führt die Vereinschronik.",
                        ArchivedIn2021
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
