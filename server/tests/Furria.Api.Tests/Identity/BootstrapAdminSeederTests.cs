using Furria.Application.Authorization;
using Furria.Application.Identity;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Identity;

[Collection("Api")]
public sealed class BootstrapAdminSeederTests
{
    private readonly ApiTestFixture _fixture;

    public BootstrapAdminSeederTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CreateTheAdminAndItsPerson_When_TheDatabaseHadNoAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        await ctx
            .Expected.Account(_fixture.BootstrapAdmin.AccountId)
            .ToHaveEmail(ApiTestFixture.BootstrapAdminEmail)
            .Account(_fixture.BootstrapAdmin.AccountId)
            .ToBeLinkedTo(_fixture.BootstrapAdmin.PersonId)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_HaveNoMembership_When_TheAdminIsSeeded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        await ctx
            .Expected.MembershipsOfPerson(_fixture.BootstrapAdmin.PersonId)
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_CreateNoFurtherAccount_When_TheSeederRunsAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        await _fixture.RunBootstrapSeederAsync(ct);

        await ctx.Expected.Accounts().ToHaveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AcceptTheConfiguredCredentials_When_TheAdminLogsIn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var session = await ctx.Identity.LogInAsync(
            ApiTestFixture.BootstrapAdminEmail,
            ApiTestFixture.BootstrapAdminPassword,
            ct
        );

        Assert.NotEmpty(session.AccessToken);
    }

    [Fact]
    public async Task Should_RestoreTheAdmin_When_TheDatabaseIsReset()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );

        await _fixture.ResetDatabaseAsync(ct);

        await ctx
            .Expected.Accounts()
            .ToHaveCount(1)
            .Account(_fixture.BootstrapAdmin.AccountId)
            .ToExist()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_GrantTheAdminRolleEveryBerechtigung_When_ItIsSeeded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        await ctx
            .Expected.Role(_fixture.AdminRoleId)
            .ToHaveName("Admin")
            .Role(_fixture.AdminRoleId)
            .ToGrantExactly([.. FurriaPermissions.All])
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_GiveTheAdminAnOpenInhaberschaft_When_TheRolleIsSeeded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        await ctx
            .Expected.RoleHoldingsOfPerson(_fixture.BootstrapAdmin.PersonId)
            .ToHaveOpenCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_CreateNoSecondAdminRolle_When_TheSeederRunsAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        await _fixture.RunBootstrapSeederAsync(ct);

        await ctx
            .Expected.Roles()
            .ToHaveCount(1)
            .RoleHoldingsOfPerson(_fixture.BootstrapAdmin.PersonId)
            .ToHaveOpenCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_CreateNothing_When_TheBootstrapAdminIsNotConfigured()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        await _fixture.DeleteAccountDirectlyAsync(_fixture.BootstrapAdmin.AccountId, ct);

        await _fixture.RunBootstrapSeederAsync(new BootstrapAdminOptions(), ct);

        await ctx.Expected.Accounts().ToHaveCount(0).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_CreateTheBootstrapAccountAgain_When_OnlyOtherAccountsRemain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        await _fixture.DeleteAccountDirectlyAsync(_fixture.BootstrapAdmin.AccountId, ct);

        await _fixture.RunBootstrapSeederAsync(ct);

        await ctx
            .Expected.Accounts()
            .ToContainEmail(ApiTestFixture.BootstrapAdminEmail)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_CreateNoSecondAccount_When_TheConfiguredEmailDiffersOnlyInCase()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        await _fixture.RunBootstrapSeederAsync(
            new BootstrapAdminOptions
            {
                Email = ApiTestFixture.BootstrapAdminEmail.ToUpperInvariant(),
                Password = ApiTestFixture.BootstrapAdminPassword,
                FirstName = "Bootstrap",
                LastName = "Admin",
            },
            ct
        );

        await ctx.Expected.Accounts().ToHaveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_GrantTheMissingBerechtigung_When_TheAdminRolleLacksOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        await _fixture.RemoveRolePermissionDirectlyAsync(
            _fixture.AdminRoleId,
            FurriaPermissions.RolesManage,
            ct
        );

        await _fixture.RunBootstrapSeederAsync(ct);

        await ctx
            .Expected.Role(_fixture.AdminRoleId)
            .ToGrantExactly([.. FurriaPermissions.All])
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_EnableTheAdminAccount_When_ItWasDisabled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        await _fixture.DisableAccountDirectlyAsync(_fixture.BootstrapAdmin.AccountId, ct);

        await _fixture.RunBootstrapSeederAsync(ct);

        await ctx
            .Expected.Account(_fixture.BootstrapAdmin.AccountId)
            .ToBeDisabled(false)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_UnarchiveTheAdminRolle_When_TheClubArchivedIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        await _fixture.ArchiveRoleDirectlyAsync(_fixture.AdminRoleId, _fixture.Today, ct);

        await _fixture.RunBootstrapSeederAsync(ct);

        await ctx.Expected.Role(_fixture.AdminRoleId).ToBeArchivedOn(null).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_CreateNoSecondAdminRolle_When_TheClubRenamedItToAnotherCase()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        await _fixture.EditRoleNameDirectlyAsync(_fixture.AdminRoleId, "ADMIN", ct);

        await _fixture.RunBootstrapSeederAsync(ct);

        await ctx.Expected.Roles().ToHaveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_OpenAnInhaberschaft_When_TheAdminRolleLostEveryInhaber()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        await _fixture.RemoveRoleHoldingsDirectlyAsync(_fixture.AdminRoleId, ct);

        await _fixture.RunBootstrapSeederAsync(ct);

        await ctx
            .Expected.Roles()
            .ToHaveCount(1)
            .RoleHoldingsOfPerson(_fixture.BootstrapAdmin.PersonId)
            .ToHaveOpenCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_OpenAFurtherInhaberschaft_When_TheLastOneOnTheAdminRolleHasEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromDays(2),
            async () =>
            {
                await _fixture.EndRoleHoldingsDirectlyAsync(
                    _fixture.AdminRoleId,
                    _fixture.Today.AddDays(-1),
                    ct
                );

                await _fixture.RunBootstrapSeederAsync(ct);

                await ctx
                    .Expected.RoleHoldingsOfPerson(_fixture.BootstrapAdmin.PersonId)
                    .ToHaveCount(2)
                    .RoleHoldingsOfPerson(_fixture.BootstrapAdmin.PersonId)
                    .ToHaveOpenCount(1)
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_RestoreTheAdminRolle_When_TheDatabaseIsReset()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Roles(roles =>
                    roles.AddRole("gruppenpflege", "Gruppenpflege", FurriaPermissions.GroupsManage)
                ),
            ct
        );

        await _fixture.ResetDatabaseAsync(ct);

        await ctx
            .Expected.Roles()
            .ToHaveCount(1)
            .Role(_fixture.AdminRoleId)
            .ToGrantExactly([.. FurriaPermissions.All])
            .RoleHoldingsOfPerson(_fixture.BootstrapAdmin.PersonId)
            .ToHaveOpenCount(1)
            .AssertAsync(ct);
    }
}
