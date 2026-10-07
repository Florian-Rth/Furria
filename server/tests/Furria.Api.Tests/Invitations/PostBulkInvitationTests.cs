using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Invitations;
using Furria.Api.Tests.Auth;
using Furria.Application.Authorization;
using Furria.Core.Identity;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Invitations;

[Collection("Api")]
public sealed class PostBulkInvitationTests
{
    private const string InvitationSubject = "Dein Zugang zur Vereins-App";

    private readonly ApiTestFixture _fixture;

    public PostBulkInvitationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_MailEveryEligibleNeverInvitedPerson_When_TheRoundIsSent()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var beaEmail = InvitationSteps.UniqueContactEmail("bea");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                        .AddEligiblePerson("bea", "Bea", beaEmail, _fixture.Today)
                        .AddPerson("carla", "Carla", "Muster")
                        .AddPersonContact(
                            "carla",
                            birthDate: _fixture.Today.AddYears(-30),
                            withoutEmail: true
                        )
                        .AddMembership("carla-membership", "carla", _fixture.Today.AddYears(-1))
                        .AddEligiblePerson(
                            "gina",
                            "Gina",
                            InvitationSteps.UniqueContactEmail("gina"),
                            _fixture.Today
                        )
                        .AddAccount("gina")
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);

        var sent = await InvitationRoundSteps.InviteAllAsync(manager);

        Assert.Equal(2, sent);
        var annaMail = await _fixture.Mailbox.SingleMailToAsync(annaEmail, ct);
        Assert.Equal(InvitationSubject, annaMail.Subject);
        Assert.Contains("Hallo Anna,", annaMail.Text, StringComparison.Ordinal);
        Assert.StartsWith(
            $"{ApiTestFixture.ClubAppBaseUrl}/invitation#token=",
            annaMail.Link(),
            StringComparison.Ordinal
        );
        var beaMail = await _fixture.Mailbox.SingleMailToAsync(beaEmail, ct);
        Assert.Contains("Hallo Bea,", beaMail.Text, StringComparison.Ordinal);
        await ctx
            .Expected.InvitationsOfPerson(annaId)
            .ToHaveCount(1)
            .LiveInvitationOfPerson(annaId)
            .ToBeIssuedAs(InvitationChannel.Mail, isReminder: false, issuedByPersonId: null)
            .AccountEventsOfPerson(annaId)
            .ToHaveKindsInOrder(AccountEventKind.Invited)
            .AccountEventsOfPerson(annaId)
            .ToHaveNoLatestActor()
            .InvitationsOfPerson(ctx.Identity.People.IdOf("bea"))
            .ToHaveLiveCount(1)
            .InvitationsOfPerson(ctx.Identity.People.IdOf("carla"))
            .ToHaveCount(0)
            .InvitationsOfPerson(ctx.Identity.People.IdOf("gina"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SendNothingToAnyoneAlreadyInvited_When_ASecondRoundIsSent()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                        .AddEligiblePerson(
                            "bea",
                            "Bea",
                            InvitationSteps.UniqueContactEmail("bea"),
                            _fixture.Today
                        )
                ),
            ct
        );
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        var first = await InvitationRoundSteps.InviteAllAsync(manager);

        var second = await InvitationRoundSteps.InviteAllAsync(manager);

        Assert.Equal(2, first);
        Assert.Equal(0, second);
        await _fixture.Mailbox.SingleMailToAsync(annaEmail, ct);
        await ctx
            .Expected.InvitationsOfPerson(ctx.Identity.People.IdOf("anna"))
            .ToHaveCount(1)
            .InvitationsOfPerson(ctx.Identity.People.IdOf("bea"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LeaveOutAPersonInvitedByHand_When_TheRoundIsSent()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddEligiblePerson(
                            "anna",
                            "Anna",
                            InvitationSteps.UniqueContactEmail("anna"),
                            _fixture.Today
                        )
                        .AddEligiblePerson(
                            "bea",
                            "Bea",
                            InvitationSteps.UniqueContactEmail("bea"),
                            _fixture.Today
                        )
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        await InvitationSteps.InviteAsync(manager, annaId);

        var sent = await InvitationRoundSteps.InviteAllAsync(manager);

        Assert.Equal(1, sent);
        await ctx
            .Expected.InvitationsOfPerson(annaId)
            .ToHaveCount(1)
            .InvitationsOfPerson(ctx.Identity.People.IdOf("bea"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LeaveOutAPersonWhoseInvitationExpired_When_TheRoundIsSent()
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
            InvitationRoundSteps.PastTheMailLifetime,
            async () =>
            {
                var laterManager = await ctx.Identity.ManagingLoginClientAsync(ct);
                var sent = await InvitationRoundSteps.InviteAllAsync(laterManager);

                Assert.Equal(0, sent);
            }
        );

        await ctx.Expected.InvitationsOfPerson(annaId).ToHaveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SendExactlyAsManyAsThePreviewCounted_When_ThePreviewWasReadFirst()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddEligiblePerson(
                            "anna",
                            "Anna",
                            InvitationSteps.UniqueContactEmail("anna"),
                            _fixture.Today
                        )
                        .AddEligiblePerson(
                            "bea",
                            "Bea",
                            InvitationSteps.UniqueContactEmail("bea"),
                            _fixture.Today
                        )
                        .AddEligiblePerson(
                            "carla",
                            "Carla",
                            InvitationSteps.UniqueContactEmail("carla"),
                            _fixture.Today
                        )
                        .AddPerson("dora", "Dora", "Muster")
                        .AddPersonContact(
                            "dora",
                            InvitationSteps.UniqueContactEmail("dora"),
                            birthDate: _fixture.Today.AddYears(-10)
                        )
                        .AddMembership("dora-membership", "dora", _fixture.Today.AddYears(-1))
                ),
            ct
        );
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        await InvitationSteps.InviteAsync(manager, ctx.Identity.People.IdOf("carla"));
        var preview = await InvitationRoundSteps.PreviewAsync(manager);

        var sent = await InvitationRoundSteps.InviteAllAsync(manager);

        Assert.Equal(preview.InviteCount, sent);
        Assert.Equal(2, sent);
        await ctx
            .Expected.InvitationsOfPerson(ctx.Identity.People.IdOf("dora"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LetHerRedeemTheLinkFromTheRound_When_SheOpensTheMail()
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
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        await InvitationRoundSteps.InviteAllAsync(manager);
        var mail = await _fixture.Mailbox.SingleMailToAsync(annaEmail, ct);

        var (response, _) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            mail.LinkToken()
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.AccountOfPerson(ctx.Identity.People.IdOf("anna"))
            .ToHaveLoginEmail(annaEmail)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_NeverAnswerWithAServerError_When_TwoRoundsRace()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddEligiblePerson(
                            "anna",
                            "Anna",
                            InvitationSteps.UniqueContactEmail("anna"),
                            _fixture.Today
                        )
                        .AddEligiblePerson(
                            "bea",
                            "Bea",
                            InvitationSteps.UniqueContactEmail("bea"),
                            _fixture.Today
                        )
                ),
            ct
        );
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);

        var rounds = await Task.WhenAll(
            manager.POSTAsync<PostBulkInvitation, PostBulkInvitationResponse>(),
            manager.POSTAsync<PostBulkInvitation, PostBulkInvitationResponse>()
        );

        Assert.All(
            rounds,
            round =>
                Assert.Contains(
                    round.Response.StatusCode,
                    new[] { HttpStatusCode.OK, HttpStatusCode.Conflict }
                )
        );
        Assert.Equal(
            2,
            rounds
                .Where(round => round.Response.StatusCode == HttpStatusCode.OK)
                .Sum(round => round.Result.SentCount)
        );
        await ctx
            .Expected.InvitationsOfPerson(ctx.Identity.People.IdOf("anna"))
            .ToHaveCount(1)
            .InvitationsOfPerson(ctx.Identity.People.IdOf("bea"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldPersonsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddEligiblePerson(
                                "anna",
                                "Anna",
                                InvitationSteps.UniqueContactEmail("anna"),
                                _fixture.Today
                            )
                            .AddAccount("ilka")
                    )
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
            PostBulkInvitation,
            PostBulkInvitationResponse
        >();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.InvitationsOfPerson(ctx.Identity.People.IdOf("anna"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }
}
