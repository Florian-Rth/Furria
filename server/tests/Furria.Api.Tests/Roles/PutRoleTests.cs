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
public sealed class PutRoleTests
{
    private const string ConflictField = "conflict";
    private const string DuplicateNameMessage = "Eine Rolle mit diesem Namen gibt es schon.";
    private const string ArchivedRoleMessage =
        "Eine archivierte Rolle kann nicht bearbeitet werden.";
    private const int UnknownRoleId = 999_999;

    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PutRoleTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<HttpResponseMessage> RenameRoleAsync(
        HttpClient client,
        int roleId,
        string name,
        string description
    ) =>
        client.PUTAsync<PutRole, PutRoleRequest>(
            new PutRoleRequest
            {
                RoleId = roleId,
                Name = name,
                Description = description,
            }
        );

    [Fact]
    public async Task Should_RenameTheRole_When_AManagerEditsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithEquipmentWardenAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RenameRoleAsync(
            client,
            ctx.Roles.Roles.IdOf("zeugwart"),
            "Materialwart",
            "Hütet das Material des Vereins."
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Role(ctx.Roles.Roles.IdOf("zeugwart"))
            .ToHaveName("Materialwart")
            .Role(ctx.Roles.Roles.IdOf("zeugwart"))
            .ToHaveDescription("Hütet das Material des Vereins.")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheName_When_OnlyTheDescriptionChanges()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithEquipmentWardenAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RenameRoleAsync(
            client,
            ctx.Roles.Roles.IdOf("zeugwart"),
            "Zeugwart",
            "Neue Beschreibung."
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Role(ctx.Roles.Roles.IdOf("zeugwart"))
            .ToHaveDescription("Neue Beschreibung.")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheKeys_When_TheRoleIsRenamed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Roles(roles =>
                    roles.AddRole("gruppenpflege", "Gruppenpflege", FurriaPermissions.GroupsManage)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RenameRoleAsync(
            client,
            ctx.Roles.Roles.IdOf("gruppenpflege"),
            "Gruppenbetreuung",
            "Pflegt die Gruppen."
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Role(ctx.Roles.Roles.IdOf("gruppenpflege"))
            .ToGrantExactly(FurriaPermissions.GroupsManage)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_AnotherActiveRoleCarriesTheName()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Roles(roles =>
                    roles.AddRole("zeugwart", "Zeugwart").AddRole("chronik", "Chronik")
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RenameRoleAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            "zeugwart",
            "Doppelter Name."
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([DuplicateNameMessage], failures[ConflictField]);
        await ctx
            .Expected.Role(ctx.Roles.Roles.IdOf("chronik"))
            .ToHaveName("Chronik")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheRoleIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
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

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RenameRoleAsync(
            client,
            ctx.Roles.Roles.IdOf("chronik"),
            "Archivpflege",
            "Neue Beschreibung."
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([ArchivedRoleMessage], failures[ConflictField]);
        await ctx
            .Expected.Role(ctx.Roles.Roles.IdOf("chronik"))
            .ToHaveName("Chronik")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheRoleIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RenameRoleAsync(client, UnknownRoleId, "Zeugwart", "Gibt es nicht.");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheRouteCarriesNoUsableId()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var response = await RenameRoleAsync(client, 0, "Zeugwart", "Ohne Id.");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldRolesManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("ilka"))
                    .Roles(roles =>
                        roles
                            .AddRole("zeugwart", "Zeugwart")
                            .AddRoleWithHolder(
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
        var response = await RenameRoleAsync(
            client,
            ctx.Roles.Roles.IdOf("zeugwart"),
            "Materialwart",
            "Nicht erlaubt."
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.Role(ctx.Roles.Roles.IdOf("zeugwart"))
            .ToHaveName("Zeugwart")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithEquipmentWardenAsync(ct);

        var response = await RenameRoleAsync(
            _fixture.CreateClient(),
            ctx.Roles.Roles.IdOf("zeugwart"),
            "Materialwart",
            "Nicht angemeldet."
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx
            .Expected.Role(ctx.Roles.Roles.IdOf("zeugwart"))
            .ToHaveName("Zeugwart")
            .AssertAsync(ct);
    }

    private Task<SeededContext> BuildWithEquipmentWardenAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder.Roles(roles =>
                    roles.AddRoleWithDetails(
                        "zeugwart",
                        "Zeugwart",
                        "Die alte Beschreibung.",
                        archivedOn: null
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
