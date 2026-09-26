using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Api.Endpoints.Invitations;
using Furria.Api.Tests.Auth;
using Furria.Application.Authorization;
using Furria.Core.Identity;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Invitations;

[Collection("Api")]
public sealed class PostInvitationRemindersTests
{
    private const string ReminderSubject = "Erinnerung: Dein Zugang zur Vereins-App";

    private readonly ApiTestFixture _fixture;

    public PostInvitationRemindersTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReissueTheInvitationAsAReminder_When_ItIsOpenAndOlderThanThreeDays()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var adminId = ctx.Identity.BootstrapAdmin.PersonId;
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        await InvitationSteps.InviteAsync(manager, annaId);

        await _fixture.AtLaterTimeAsync(
            InvitationRoundSteps.PastTheReminderDelay,
            async () =>
            {
                var laterManager = await ctx.Identity.BootstrapAdminClientAsync(ct);
                var sent = await InvitationRoundSteps.RemindAllAsync(laterManager);

                Assert.Equal(1, sent);
                var mails = await _fixture.Mailbox.MailsToAsync(annaEmail, 2, ct);
                Assert.Equal(ReminderSubject, mails[1].Subject);
                Assert.Contains("Hallo Anna,", mails[1].Text, StringComparison.Ordinal);
                var anonymous = _fixture.CreateClient();
                var (_, first) = await InvitationSteps.LookUpAsync(anonymous, mails[0].LinkToken());
                var (_, reminder) = await InvitationSteps.LookUpAsync(
                    anonymous,
                    mails[1].LinkToken()
                );
                Assert.Equal(InvitationLookupStatus.Dead, first.Status);
                Assert.Equal(InvitationLookupStatus.Live, reminder.Status);
            }
        );

        await ctx
            .Expected.InvitationsOfPerson(annaId)
            .ToHaveCount(2)
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCount(1)
            .LiveInvitationOfPerson(annaId)
            .ToBeIssuedAs(InvitationChannel.Mail, isReminder: true, adminId)
            .AccountEventsOfPerson(annaId)
            .ToHaveKindsInOrder(AccountEventKind.Invited, AccountEventKind.Reminded)
            .AccountEventsOfPerson(annaId)
            .ToHaveLatestActor(adminId)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RemindNobody_When_TheInvitationIsYoungerThanThreeDays()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson(
                        "anna",
                        "Anna",
                        InvitationSteps.UniqueContactEmail("anna"),
                        _fixture.Today
                    )
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        await InvitationSteps.InviteAsync(manager, annaId);

        await _fixture.AtLaterTimeAsync(
            InvitationRoundSteps.WithinTheReminderDelay,
            async () =>
            {
                var laterManager = await ctx.Identity.BootstrapAdminClientAsync(ct);
                var sent = await InvitationRoundSteps.RemindAllAsync(laterManager);

                Assert.Equal(0, sent);
            }
        );

        await ctx.Expected.InvitationsOfPerson(annaId).ToHaveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RemindHer_When_HerOpenInvitationHasExpired()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        await InvitationSteps.InviteAsync(manager, annaId);

        await _fixture.AtLaterTimeAsync(
            InvitationRoundSteps.PastTheMailLifetime,
            async () =>
            {
                var laterManager = await ctx.Identity.BootstrapAdminClientAsync(ct);
                var sent = await InvitationRoundSteps.RemindAllAsync(laterManager);

                Assert.Equal(1, sent);
                var mails = await _fixture.Mailbox.MailsToAsync(annaEmail, 2, ct);
                var (_, reminder) = await InvitationSteps.LookUpAsync(
                    _fixture.CreateClient(),
                    mails[1].LinkToken()
                );
                Assert.Equal(InvitationLookupStatus.Live, reminder.Status);
            }
        );
    }

    [Fact]
    public async Task Should_RemindNobody_When_SheIsNoLongerEligible()
    {
        var ct = TestContext.Current.CancellationToken;
        var today = _fixture.Today;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("anna", "Anna", "Muster")
                        .AddPersonContact(
                            "anna",
                            InvitationSteps.UniqueContactEmail("anna"),
                            birthDate: today.AddYears(-30)
                        )
                        .AddMembership(
                            "anna-membership",
                            "anna",
                            today.AddYears(-1),
                            today.AddDays(1)
                        )
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        await InvitationSteps.InviteAsync(manager, annaId);

        await _fixture.AtLaterTimeAsync(
            InvitationRoundSteps.PastTheReminderDelay,
            async () =>
            {
                var laterManager = await ctx.Identity.BootstrapAdminClientAsync(ct);
                var sent = await InvitationRoundSteps.RemindAllAsync(laterManager);

                Assert.Equal(0, sent);
            }
        );

        await ctx.Expected.InvitationsOfPerson(annaId).ToHaveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RemindNobody_When_TheInvitationWasRedeemed()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var token = await InvitationSteps.InviteAndReadTokenAsync(
            _fixture,
            manager,
            annaId,
            annaEmail,
            ct
        );
        await InvitationSteps.RedeemAsync(_fixture.CreateClient(), token);

        await _fixture.AtLaterTimeAsync(
            InvitationRoundSteps.PastTheReminderDelay,
            async () =>
            {
                var laterManager = await ctx.Identity.BootstrapAdminClientAsync(ct);
                var sent = await InvitationRoundSteps.RemindAllAsync(laterManager);

                Assert.Equal(0, sent);
            }
        );

        await ctx.Expected.InvitationsOfPerson(annaId).ToHaveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RemindNobody_When_SheWasNeverInvited()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson(
                        "anna",
                        "Anna",
                        InvitationSteps.UniqueContactEmail("anna"),
                        _fixture.Today
                    )
                ),
            ct
        );
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);

        var sent = await InvitationRoundSteps.RemindAllAsync(manager);

        Assert.Equal(0, sent);
        await ctx
            .Expected.InvitationsOfPerson(ctx.Identity.People.IdOf("anna"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RemindNobodyAgain_When_TheRemindersWentOutJustNow()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson(
                        "anna",
                        "Anna",
                        InvitationSteps.UniqueContactEmail("anna"),
                        _fixture.Today
                    )
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        await InvitationSteps.InviteAsync(manager, annaId);

        await _fixture.AtLaterTimeAsync(
            InvitationRoundSteps.PastTheReminderDelay,
            async () =>
            {
                var laterManager = await ctx.Identity.BootstrapAdminClientAsync(ct);
                var first = await InvitationRoundSteps.RemindAllAsync(laterManager);
                var second = await InvitationRoundSteps.RemindAllAsync(laterManager);

                Assert.Equal(1, first);
                Assert.Equal(0, second);
            }
        );

        await ctx.Expected.InvitationsOfPerson(annaId).ToHaveCount(2).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SendExactlyAsManyAsThePreviewCounted_When_ThePreviewWasReadFirst()
    {
        var ct = TestContext.Current.CancellationToken;
        var today = _fixture.Today;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddEligiblePerson(
                            "anna",
                            "Anna",
                            InvitationSteps.UniqueContactEmail("anna"),
                            today
                        )
                        .AddEligiblePerson(
                            "bea",
                            "Bea",
                            InvitationSteps.UniqueContactEmail("bea"),
                            today
                        )
                        .AddEligiblePerson(
                            "carla",
                            "Carla",
                            InvitationSteps.UniqueContactEmail("carla"),
                            today
                        )
                        .AddPerson("dora", "Dora", "Muster")
                        .AddPersonContact(
                            "dora",
                            InvitationSteps.UniqueContactEmail("dora"),
                            birthDate: today.AddYears(-30)
                        )
                        .AddMembership(
                            "dora-membership",
                            "dora",
                            today.AddYears(-1),
                            today.AddDays(1)
                        )
                ),
            ct
        );
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        await InvitationSteps.InviteAsync(manager, ctx.Identity.People.IdOf("anna"));
        await InvitationSteps.InviteAsync(manager, ctx.Identity.People.IdOf("bea"));
        await InvitationSteps.InviteAsync(manager, ctx.Identity.People.IdOf("dora"));

        await _fixture.AtLaterTimeAsync(
            InvitationRoundSteps.PastTheReminderDelay,
            async () =>
            {
                var laterManager = await ctx.Identity.BootstrapAdminClientAsync(ct);
                await InvitationSteps.InviteAsync(laterManager, ctx.Identity.People.IdOf("carla"));
                var preview = await InvitationRoundSteps.PreviewAsync(laterManager);

                var sent = await InvitationRoundSteps.RemindAllAsync(laterManager);

                Assert.Equal(preview.RemindCount, sent);
                Assert.Equal(2, sent);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldPersonsManage()
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
        var (response, _) = await client.POSTAsync<
            PostInvitationReminders,
            PostInvitationRemindersResponse
        >();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
