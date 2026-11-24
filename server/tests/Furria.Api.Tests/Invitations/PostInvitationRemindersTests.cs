using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Api.Tests.Auth;
using Furria.Core.Identity;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Invitations;

public sealed class PostInvitationRemindersTests : IClassFixture<ApiTestFixture>
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
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        await InvitationSteps.InviteAsync(manager, annaId);

        await _fixture.AtLaterTimeAsync(
            InvitationRoundSteps.PastTheReminderDelay,
            async () =>
            {
                var laterManager = await ctx.Identity.ManagingLoginClientAsync(ct);
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
            .ToBeIssuedAs(InvitationChannel.Mail, isReminder: true, issuedByPersonId: null)
            .AccountEventsOfPerson(annaId)
            .ToHaveKindsInOrder(AccountEventKind.Invited, AccountEventKind.Reminded)
            .AccountEventsOfPerson(annaId)
            .ToHaveNoLatestActor()
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
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        await InvitationSteps.InviteAsync(manager, annaId);

        await _fixture.AtLaterTimeAsync(
            InvitationRoundSteps.WithinTheReminderDelay,
            async () =>
            {
                var laterManager = await ctx.Identity.ManagingLoginClientAsync(ct);
                var sent = await InvitationRoundSteps.RemindAllAsync(laterManager);

                Assert.Equal(0, sent);
            }
        );

        await ctx.Expected.InvitationsOfPerson(annaId).ToHaveCount(1).AssertAsync(ct);
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
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        await InvitationSteps.InviteAsync(manager, annaId);

        await _fixture.AtLaterTimeAsync(
            InvitationRoundSteps.PastTheReminderDelay,
            async () =>
            {
                var laterManager = await ctx.Identity.ManagingLoginClientAsync(ct);
                var first = await InvitationRoundSteps.RemindAllAsync(laterManager);
                var second = await InvitationRoundSteps.RemindAllAsync(laterManager);

                Assert.Equal(1, first);
                Assert.Equal(0, second);
            }
        );

        await ctx.Expected.InvitationsOfPerson(annaId).ToHaveCount(2).AssertAsync(ct);
    }
}
