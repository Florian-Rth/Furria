using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Api.Tests.Auth;
using Furria.Application.Authorization;
using Furria.Application.Identity;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Identity;

public sealed class ManagingLoginSeederTests : IClassFixture<ApiTestFixture>
{
    private const string OtherPassword = "Andere-Verwaltung-Pw-2!";

    private static readonly DateTimeOffset ChangedInSpring = new(
        2026,
        4,
        2,
        10,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public ManagingLoginSeederTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CreateTheManagingLoginWithoutAPerson_When_TheDatabaseHadNoAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        await ctx
            .Expected.Account(_fixture.ManagingLogin.AccountId)
            .ToHaveEmail(ApiTestFixture.ManagingLoginEmail)
            .Account(_fixture.ManagingLogin.AccountId)
            .ToBeTheManagingLogin()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RecreateTheManagingLogin_When_ItWasDeletedWhileOtherAccountsRemain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        await _fixture.DeleteAccountDirectlyAsync(_fixture.ManagingLogin.AccountId, ct);

        await _fixture.RunManagingLoginSeederAsync(ct);

        await ctx
            .Expected.Accounts()
            .ToHaveCount(2)
            .Accounts()
            .ToHoldOneManagingLoginAt(ApiTestFixture.ManagingLoginEmail)
            .Account(ctx.Identity.Accounts.IdOf("alice"))
            .ToBeLinkedTo(ctx.Identity.People.IdOf("alice"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_MoveTheSameAccount_When_TheConfiguredEmailChanges()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var movedEmail = InvitationSteps.UniqueContactEmail("verwaltung");

        await _fixture.RunManagingLoginSeederAsync(
            Configured(movedEmail, ApiTestFixture.ManagingLoginPassword),
            ct
        );

        await ctx
            .Expected.Accounts()
            .ToHaveCount(1)
            .Account(_fixture.ManagingLogin.AccountId)
            .ToHaveEmail(movedEmail)
            .Account(_fixture.ManagingLogin.AccountId)
            .ToSignInAs(movedEmail)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheFormerPassword_When_ThePasswordChanges()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        await _fixture.RunManagingLoginSeederAsync(
            Configured(ApiTestFixture.ManagingLoginEmail, OtherPassword),
            ct
        );

        var (response, _) = await _fixture
            .CreateClient()
            .POSTAsync<Login, LoginRequest, LoginResponse>(
                new()
                {
                    Email = ApiTestFixture.ManagingLoginEmail,
                    Password = ApiTestFixture.ManagingLoginPassword,
                }
            );
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_EndEverySession_When_ThePasswordChanges()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        await ctx.Identity.ManagingLoginClientAsync(ct);

        await _fixture.RunManagingLoginSeederAsync(
            Configured(ApiTestFixture.ManagingLoginEmail, OtherPassword),
            ct
        );

        await ctx
            .Expected.RefreshTokensOf(_fixture.ManagingLogin.AccountId)
            .ToHaveActiveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseToStart_When_TheConfiguredEmailBelongsToAnotherAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _fixture.RunManagingLoginSeederAsync(
                Configured(ctx.Identity.EmailOf("alice"), ApiTestFixture.ManagingLoginPassword),
                ct
            )
        );
    }

    [Fact]
    public async Task Should_TurnTheFormerAdminAccountIntoTheManagingLogin_When_NoManagingLoginExists()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        await ctx.Identity.ClientForAsync("alice", ct);
        await _fixture.DeleteAccountDirectlyAsync(_fixture.ManagingLogin.AccountId, ct);

        await _fixture.RunManagingLoginSeederAsync(
            Configured(ctx.Identity.EmailOf("alice"), ApiTestFixture.ManagingLoginPassword),
            ct
        );

        var formerAdmin = ctx.Identity.Accounts.IdOf("alice");
        await ctx
            .Expected.Accounts()
            .ToHaveCount(1)
            .Account(formerAdmin)
            .ToBeTheManagingLogin()
            .Person(ctx.Identity.People.IdOf("alice"))
            .ToNotExist()
            .RefreshTokensOf(formerAdmin)
            .ToHaveActiveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_EraseEveryChainOfTheFormerAdmin_When_HerAccountBecomesTheManagingLogin()
    {
        var ct = TestContext.Current.CancellationToken;
        var carlaEmail = InvitationSteps.UniqueContactEmail("carla");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("alice", "Alice", "Altadmin")
                            .AddAccount("alice")
                            .AddMembership("alice-membership", "alice")
                            .AddMembershipPause("alice-pause", "alice-membership", 2024, 2024)
                            .AddFeeReduction(
                                "alice-reduction",
                                "alice",
                                FeeReductionBasis.Studies,
                                2025,
                                2026
                            )
                            .AddPerson("bert", "Bert", "Muster")
                            .AddMembership("bert-membership", "bert")
                            .AddAdmission("bert-membership", "alice", ChangedInSpring)
                            .AddContactChange("bert", "alice", ChangedInSpring)
                            .AddEligiblePerson("carla", "Carla", carlaEmail, _fixture.Today)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("garde", "Garde")
                            .AddGroupMembership("alice-garde", "garde", "alice")
                            .AddGroupAdmin("alice-garde-admin", "garde", "alice")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "pflege",
                            "alice-pflege",
                            "Pflege",
                            "alice",
                            FurriaPermissions.PersonsManage
                        )
                    )
                    .Club(club =>
                        club.AddVenue("lager", "Lager")
                            .AddKeyHolding("alice-lager", "lager", "alice")
                            .AddBoardOffice("kasse", "Kassenwart")
                            .AddBoardSeat("alice-kasse", "kasse", "alice")
                            .AddCalendarEntry(
                                "probe",
                                "Probe",
                                _fixture.TimeProvider.GetUtcNow().AddDays(7),
                                asksForResponse: true
                            )
                            .AddAttendanceResponse(
                                "alice-zusage",
                                "probe",
                                "alice",
                                AttendanceAnswer.Yes
                            )
                            .AddAnnouncement("alice-aushang", "alice", "Probe", "Alle kommen.")
                    ),
            ct
        );
        var alice = await ctx.Identity.ClientForAsync("alice", ct);
        await InvitationSteps.InviteAsync(alice, ctx.Identity.People.IdOf("carla"));
        await _fixture.DeleteAccountDirectlyAsync(_fixture.ManagingLogin.AccountId, ct);

        await _fixture.RunManagingLoginSeederAsync(
            Configured(ctx.Identity.EmailOf("alice"), ApiTestFixture.ManagingLoginPassword),
            ct
        );

        var alicePerson = ctx.Identity.People.IdOf("alice");
        await ctx
            .Expected.Person(alicePerson)
            .ToNotExist()
            .MembershipsOfPerson(alicePerson)
            .ToHaveCount(0)
            .FeeReduction(ctx.Identity.FeeReductions.IdOf("alice-reduction"))
            .ToNotExist()
            .GroupMembershipsOf(ctx.Groups.Groups.IdOf("garde"))
            .ToHaveCount(0)
            .GroupAdminsOf(ctx.Groups.Groups.IdOf("garde"))
            .ToHaveCount(0)
            .RoleHoldingsOfPerson(alicePerson)
            .ToHaveCount(0)
            .KeyHolding(ctx.Club.KeyHoldings.IdOf("alice-lager"))
            .ToNotExist()
            .BoardSeat(ctx.Club.BoardSeats.IdOf("alice-kasse"))
            .ToNotExist()
            .AttendanceResponsesFor(ctx.Club.CalendarEntries.IdOf("probe"))
            .ToCarryNoAnswerFrom(alicePerson)
            .Announcement(ctx.Club.Announcements.IdOf("alice-aushang"))
            .ToHaveAuthor(null)
            .Person(ctx.Identity.People.IdOf("bert"))
            .ToHaveContactChangedBy(null, ChangedInSpring)
            .Membership(ctx.Identity.Memberships.IdOf("bert-membership"))
            .ToRecordAdmission(null, ChangedInSpring, guardianConsentConfirmed: false)
            .LiveInvitationOfPerson(ctx.Identity.People.IdOf("carla"))
            .ToBeIssuedAs(InvitationChannel.Mail, isReminder: false, issuedByPersonId: null)
            .AccountEventsOfPerson(ctx.Identity.People.IdOf("carla"))
            .ToHaveNoLatestActor()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_CreateNoSecondAccount_When_TheConfiguredEmailDiffersOnlyInCase()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        await _fixture.RunManagingLoginSeederAsync(
            Configured(
                ApiTestFixture.ManagingLoginEmail.ToUpperInvariant(),
                ApiTestFixture.ManagingLoginPassword
            ),
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

        await _fixture.RunManagingLoginSeederAsync(ct);

        await ctx
            .Expected.Role(_fixture.AdminRoleId)
            .ToGrantExactly([.. FurriaPermissions.All])
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_EnableTheManagingLogin_When_ItWasDisabled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        await _fixture.DisableAccountDirectlyAsync(_fixture.ManagingLogin.AccountId, ct);

        await _fixture.RunManagingLoginSeederAsync(ct);

        await ctx
            .Expected.Account(_fixture.ManagingLogin.AccountId)
            .ToBeDisabled(false)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_UnarchiveTheAdminRole_When_TheClubArchivedIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        await _fixture.ArchiveRoleDirectlyAsync(_fixture.AdminRoleId, _fixture.Today, ct);

        await _fixture.RunManagingLoginSeederAsync(ct);

        await ctx.Expected.Role(_fixture.AdminRoleId).ToBeArchivedOn(null).AssertAsync(ct);
    }

    private static ManagingLoginOptions Configured(string email, string password) =>
        new() { Email = email, Password = password };
}
