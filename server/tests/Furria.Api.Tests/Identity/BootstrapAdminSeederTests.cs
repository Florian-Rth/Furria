using Furria.Application.Authorization;
using Furria.Application.Identity;
using Furria.Infrastructure.Identity;
using Furria.Tests.Common.Fixtures;
using Serilog.Events;
using Xunit;

namespace Furria.Api.Tests.Identity;

[Collection("Api")]
public sealed class BootstrapAdminSeederTests
{
    private const string SeedingSkipped = "Bootstrap admin not configured, seeding skipped";
    private const string AccountCreated = "Bootstrap admin account {AccountId} created for {Email}";
    private const string AccountReenabled = "Bootstrap admin account {AccountId} re-enabled";
    private const string RoleCreated = "Admin role {RoleId} created";
    private const string RoleRestored = "Admin role {RoleId} restored from archive";
    private const string PermissionsGranted =
        "Admin role {RoleId} granted {MissingPermissionCount} missing permissions";
    private const string RoleHandedBack =
        "Admin role {RoleId} handed back to bootstrap person {PersonId}";

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
    public async Task Should_GrantTheAdminRoleEveryPermission_When_ItIsSeeded()
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
    public async Task Should_GiveTheAdminAnOpenRoleHolding_When_TheRoleIsSeeded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        await ctx
            .Expected.RoleHoldingsOfPerson(_fixture.BootstrapAdmin.PersonId)
            .ToHaveOpenCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_CreateNoSecondAdminRole_When_TheSeederRunsAgain()
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
    public async Task Should_GrantTheMissingPermission_When_TheAdminRoleLacksOne()
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
    public async Task Should_UnarchiveTheAdminRole_When_TheClubArchivedIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        await _fixture.ArchiveRoleDirectlyAsync(_fixture.AdminRoleId, _fixture.Today, ct);

        await _fixture.RunBootstrapSeederAsync(ct);

        await ctx.Expected.Role(_fixture.AdminRoleId).ToBeArchivedOn(null).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_CreateNoSecondAdminRole_When_TheClubRenamedItToAnotherCase()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        await _fixture.EditRoleNameDirectlyAsync(_fixture.AdminRoleId, "ADMIN", ct);

        await _fixture.RunBootstrapSeederAsync(ct);

        await ctx.Expected.Roles().ToHaveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_OpenARoleHolding_When_TheAdminRoleLostEveryHolder()
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
    public async Task Should_OpenAFurtherRoleHolding_When_TheLastOneOnTheAdminRoleHasEnded()
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
    public async Task Should_RestoreTheAdminRole_When_TheDatabaseIsReset()
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

    [Fact]
    public async Task Should_ReportTheAdminRoleCreation_When_TheHostSeedsAFreshDatabase()
    {
        await _fixture.BuildAsync(TestContext.Current.CancellationToken);

        var written = Assert.Single(_fixture.Logs.Written(RoleCreated));
        Assert.Equal(LogEventLevel.Information, written.Level);
        Assert.Equal(_fixture.AdminRoleId, written.ScalarOf("RoleId"));
    }

    [Fact]
    public async Task Should_ReportTheSkippedSeeding_When_TheBootstrapAdminIsNotConfigured()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);
        var mark = _fixture.Logs.Mark();

        await _fixture.RunBootstrapSeederAsync(new BootstrapAdminOptions(), ct);

        Assert.Single(_fixture.Logs.Written(SeedingSkipped, mark));
    }

    [Fact]
    public async Task Should_ReportTheCreatedAccount_When_TheBootstrapAccountWasMissing()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        await _fixture.DeleteAccountDirectlyAsync(_fixture.BootstrapAdmin.AccountId, ct);
        var mark = _fixture.Logs.Mark();

        await _fixture.RunBootstrapSeederAsync(ct);

        var written = Assert.Single(_fixture.Logs.Written(AccountCreated, mark));
        Assert.Equal(ApiTestFixture.BootstrapAdminEmail, written.ScalarOf("Email"));
        await ctx
            .Expected.Account((int)written.ScalarOf("AccountId")!)
            .ToHaveEmail(ApiTestFixture.BootstrapAdminEmail)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReportTheReenabledAccount_When_TheAdminAccountWasDisabled()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);
        await _fixture.DisableAccountDirectlyAsync(_fixture.BootstrapAdmin.AccountId, ct);
        var mark = _fixture.Logs.Mark();

        await _fixture.RunBootstrapSeederAsync(ct);

        var written = Assert.Single(_fixture.Logs.Written(AccountReenabled, mark));
        Assert.Equal(_fixture.BootstrapAdmin.AccountId, written.ScalarOf("AccountId"));
    }

    [Fact]
    public async Task Should_ReportTheRestoredRole_When_TheClubArchivedTheAdminRole()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);
        await _fixture.ArchiveRoleDirectlyAsync(_fixture.AdminRoleId, _fixture.Today, ct);
        var mark = _fixture.Logs.Mark();

        await _fixture.RunBootstrapSeederAsync(ct);

        var written = Assert.Single(_fixture.Logs.Written(RoleRestored, mark));
        Assert.Equal(_fixture.AdminRoleId, written.ScalarOf("RoleId"));
    }

    [Fact]
    public async Task Should_ReportTheGrantedPermissions_When_TheAdminRoleLackedOne()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);
        await _fixture.RemoveRolePermissionDirectlyAsync(
            _fixture.AdminRoleId,
            FurriaPermissions.RolesManage,
            ct
        );
        var mark = _fixture.Logs.Mark();

        await _fixture.RunBootstrapSeederAsync(ct);

        var written = Assert.Single(_fixture.Logs.Written(PermissionsGranted, mark));
        Assert.Equal(_fixture.AdminRoleId, written.ScalarOf("RoleId"));
        Assert.Equal(1, written.ScalarOf("MissingPermissionCount"));
    }

    [Fact]
    public async Task Should_ReportTheHandedBackRole_When_TheAdminRoleLostEveryHolder()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);
        await _fixture.RemoveRoleHoldingsDirectlyAsync(_fixture.AdminRoleId, ct);
        var mark = _fixture.Logs.Mark();

        await _fixture.RunBootstrapSeederAsync(ct);

        var written = Assert.Single(_fixture.Logs.Written(RoleHandedBack, mark));
        Assert.Equal(_fixture.AdminRoleId, written.ScalarOf("RoleId"));
        Assert.Equal(_fixture.BootstrapAdmin.PersonId, written.ScalarOf("PersonId"));
    }

    [Fact]
    public async Task Should_ReportNothing_When_EverythingIsAlreadyInPlace()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);
        var mark = _fixture.Logs.Mark();

        await _fixture.RunBootstrapSeederAsync(ct);

        Assert.DoesNotContain(
            _fixture.Logs.Since(mark),
            logged =>
                Equals(logged.ScalarOf("SourceContext"), typeof(BootstrapAdminSeeder).FullName)
        );
    }
}
