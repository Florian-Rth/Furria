using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Roles;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Roles;

[Collection("Api")]
public sealed class GetRolesTests
{
    private static readonly DateOnly HeldSince2017 = new(2017, 9, 1);
    private static readonly DateOnly HandedOver2020 = new(2020, 3, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetRolesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CarryEveryRoleWithKeysAndHolders_When_AManagerReadsTheMatrix()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
                    .Roles(roles =>
                        roles
                            .AddRoleWithDetails(
                                "gruppenpflege",
                                "Gruppenpflege",
                                "Pflegt die Gruppen des Vereins.",
                                archivedOn: null,
                                FurriaPermissions.GroupsManage
                            )
                            .AddRoleHolding(
                                "ilka-gruppenpflege",
                                "gruppenpflege",
                                "ilka",
                                HeldSince2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<GetRoles, GetRolesResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var groupCare = Single(result, "Gruppenpflege");
        Assert.Equal(ctx.Roles.Roles.IdOf("gruppenpflege"), groupCare.RoleId);
        Assert.Equal("Pflegt die Gruppen des Vereins.", groupCare.Description);
        Assert.Null(groupCare.ArchivedOn);
        Assert.Equal([FurriaPermissions.GroupsManage], groupCare.PermissionKeys);
        var ilka = Assert.Single(groupCare.Holders);
        Assert.Equal(ctx.Identity.People.IdOf("ilka"), ilka.PersonId);
        Assert.Equal("Ilka", ilka.FirstName);
        Assert.Equal("Reineke", ilka.LastName);
    }

    [Fact]
    public async Task Should_CarryTheEnforceableCatalogue_When_TheMatrixIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<GetRoles, GetRolesResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(FurriaPermissions.All, result.PermissionKeys);
    }

    [Fact]
    public async Task Should_ListTheArchivedRole_When_TheMatrixIsRead()
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
        var (response, result) = await client.GETAsync<GetRoles, GetRolesResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ArchivedIn2021, Single(result, "Chronik").ArchivedOn);
    }

    [Fact]
    public async Task Should_OmitTheHolder_When_HerRoleHoldingHasEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddPerson("katrin", "Katrin", "Adam")
                    )
                    .Roles(roles =>
                        roles
                            .AddRole("gruppenpflege", "Gruppenpflege")
                            .AddRoleHolding(
                                "ilka-gruppenpflege",
                                "gruppenpflege",
                                "ilka",
                                HeldSince2017,
                                HandedOver2020
                            )
                            .AddRoleHolding(
                                "katrin-gruppenpflege",
                                "gruppenpflege",
                                "katrin",
                                HandedOver2020.AddDays(1)
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<GetRoles, GetRolesResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var katrin = Assert.Single(Single(result, "Gruppenpflege").Holders);
        Assert.Equal(ctx.Identity.People.IdOf("katrin"), katrin.PersonId);
    }

    [Fact]
    public async Task Should_CarryNoKeys_When_ARoleGrantsNothing()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Roles(roles => roles.AddRole("zeugwart", "Zeugwart")),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<GetRoles, GetRolesResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(Single(result, "Zeugwart").PermissionKeys);
        Assert.Empty(Single(result, "Zeugwart").Holders);
    }

    [Fact]
    public async Task Should_SortUmlautsAsGerman_When_ListingRoles()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Roles(roles =>
                    roles
                        .AddRole("zeugwart", "Zeugwart")
                        .AddRole("oeffentlichkeit", "Öffentlichkeit")
                        .AddRole("organisation", "Organisation")
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<GetRoles, GetRolesResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(IndexOf(result, "Öffentlichkeit") < IndexOf(result, "Organisation"));
        Assert.True(IndexOf(result, "Öffentlichkeit") < IndexOf(result, "Zeugwart"));
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldRolesManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithGroupCareHolderAsync(ct);

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.GETAsync<GetRoles, GetRolesResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture.CreateClient().GETAsync<GetRoles, GetRolesResponse>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private Task<SeededContext> BuildWithGroupCareHolderAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
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

    private static RoleSummaryDto Single(GetRolesResponse response, string name) =>
        Assert.Single(response.Roles, role => role.Name == name);

    private static int IndexOf(GetRolesResponse response, string name)
    {
        for (var index = 0; index < response.Roles.Count; index++)
        {
            if (response.Roles[index].Name == name)
                return index;
        }

        throw new InvalidOperationException($"The Rolle \"{name}\" is not in the payload.");
    }
}
