using System.Net;
using Furria.Api.Tests.Auth;
using Furria.Application.Authorization;
using Furria.Application.MembershipApplications;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.MembershipApplications;

public sealed class ConfirmMembershipApplicationTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public ConfirmMembershipApplicationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private Task BuildWithDeciderAsync(string deciderEmail, CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("anna", "Anna").AddPersonContact("anna", deciderEmail)
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "aufnahme",
                            "anna-aufnahme",
                            "Aufnahme",
                            "anna",
                            FurriaPermissions.MembershipApplicationsDecide
                        )
                    ),
            ct
        );

    [Fact]
    public async Task Should_ConfirmTheApplication_When_ItsLinkIsFollowed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = _fixture.CreateClient();
        var token = await MembershipApplicationSteps.ApplyAndReadTokenAsync(_fixture, client, ct);

        var (response, answer) = await MembershipApplicationSteps.ConfirmAsync(client, token);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MembershipApplicationConfirmation.Confirmed, answer.Outcome);
        await ctx.Expected.MembershipApplications().ToHaveConfirmedCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_TellWhoeverDecidesApplications_When_AnApplicationIsConfirmed()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        await BuildWithDeciderAsync(annaEmail, ct);
        var client = _fixture.CreateClient();
        var token = await MembershipApplicationSteps.ApplyAndReadTokenAsync(_fixture, client, ct);

        await MembershipApplicationSteps.ConfirmAsync(client, token);

        var notice = await _fixture.Mailbox.SingleMailToAsync(annaEmail, ct);
        Assert.Equal(MembershipApplicationSteps.ArrivalNoticeSubject, notice.Subject);
        Assert.StartsWith("Hallo Anna,", notice.Text, StringComparison.Ordinal);
        Assert.Contains("Mia Schwarzwälder", notice.Text, StringComparison.Ordinal);
        Assert.StartsWith(
            MembershipApplicationSteps.ApplicationLinkPrefix,
            notice.Link(),
            StringComparison.Ordinal
        );
    }

    [Fact]
    public async Task Should_TellTheBoardSeatHolder_When_HerOfficeImpliesDecidingApplications()
    {
        var ct = TestContext.Current.CancellationToken;
        var bertaEmail = InvitationSteps.UniqueContactEmail("berta");
        await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("berta", "Berta").AddPersonContact("berta", bertaEmail)
                    )
                    .Roles(roles =>
                        roles.AddRole(
                            "aufnahme",
                            "Aufnahme",
                            FurriaPermissions.MembershipApplicationsDecide
                        )
                    )
                    .Club(club =>
                        club.AddBoardOffice(
                                "schriftfuehrung",
                                "Schriftführung",
                                impliedRoleAlias: "aufnahme"
                            )
                            .AddBoardSeat("berta-schriftfuehrung", "schriftfuehrung", "berta")
                    ),
            ct
        );
        var client = _fixture.CreateClient();
        var token = await MembershipApplicationSteps.ApplyAndReadTokenAsync(_fixture, client, ct);

        await MembershipApplicationSteps.ConfirmAsync(client, token);

        var notice = await _fixture.Mailbox.SingleMailToAsync(bertaEmail, ct);
        Assert.Equal(MembershipApplicationSteps.ArrivalNoticeSubject, notice.Subject);
    }

    [Fact]
    public async Task Should_TellOnlyWhoDecidesApplicationsToday_When_AnApplicationIsConfirmed()
    {
        var ct = TestContext.Current.CancellationToken;
        var emails = new Dictionary<string, string>
        {
            ["anna"] = InvitationSteps.UniqueContactEmail("anna"),
            ["carl"] = InvitationSteps.UniqueContactEmail("carl"),
            ["dora"] = InvitationSteps.UniqueContactEmail("dora"),
            ["emil"] = InvitationSteps.UniqueContactEmail("emil"),
            ["fritz"] = InvitationSteps.UniqueContactEmail("fritz"),
        };
        await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                    {
                        foreach (var (alias, email) in emails)
                            identity.AddPerson(alias).AddPersonContact(alias, email);
                    })
                    .Roles(roles =>
                        roles
                            .AddRoleWithHolder(
                                "aufnahme",
                                "anna-aufnahme",
                                "Aufnahme",
                                "anna",
                                FurriaPermissions.MembershipApplicationsDecide
                            )
                            .AddRoleWithHolder(
                                "personenpflege",
                                "carl-personenpflege",
                                "Personenpflege",
                                "carl",
                                FurriaPermissions.PersonsManage
                            )
                            .AddRoleHolding(
                                "dora-aufnahme",
                                "aufnahme",
                                "dora",
                                untilOn: _fixture.Today.AddDays(-1)
                            )
                            .AddRoleHolding(
                                "fritz-aufnahme",
                                "aufnahme",
                                "fritz",
                                sinceOn: _fixture.Today.AddDays(1)
                            )
                            .AddRoleWithDetails(
                                "alte-aufnahme",
                                "Alte Aufnahme",
                                "",
                                ArchivedIn2021,
                                FurriaPermissions.MembershipApplicationsDecide
                            )
                            .AddRoleHolding("emil-alte-aufnahme", "alte-aufnahme", "emil")
                    ),
            ct
        );
        var client = _fixture.CreateClient();
        var token = await MembershipApplicationSteps.ApplyAndReadTokenAsync(_fixture, client, ct);

        await MembershipApplicationSteps.ConfirmAsync(client, token);

        await _fixture.Mailbox.SingleMailToAsync(emails["anna"], ct);
        await _fixture.OutboxDrainedAsync(ct);
        foreach (var alias in new[] { "carl", "dora", "emil", "fritz" })
            Assert.Empty(await _fixture.Mailbox.MailsToAsync(emails[alias], 0, ct));
    }

    [Fact]
    public async Task Should_RepeatNothingTypedButTheName_When_TheArrivalIsNoticed()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        await BuildWithDeciderAsync(annaEmail, ct);
        var applicantEmail = InvitationSteps.UniqueContactEmail("mia");
        var application = MembershipApplicationSteps.ApplicationOf(
            applicantEmail,
            new DateOnly(1994, 7, 23)
        );
        var client = _fixture.CreateClient();
        await MembershipApplicationSteps.ApplyAsync(client, application);
        var token = (await _fixture.Mailbox.SingleMailToAsync(applicantEmail, ct)).LinkToken();

        await MembershipApplicationSteps.ConfirmAsync(client, token);

        var notice = await _fixture.Mailbox.SingleMailToAsync(annaEmail, ct);
        foreach (
            var typed in new[]
            {
                applicantEmail,
                application.Street,
                application.PostalCode,
                application.City,
                application.Phone!,
                "1994",
                "23.07.",
            }
        )
        {
            Assert.DoesNotContain(typed, notice.Subject, StringComparison.Ordinal);
            Assert.DoesNotContain(typed, notice.Text, StringComparison.Ordinal);
            Assert.DoesNotContain(typed, notice.Html, StringComparison.Ordinal);
        }
    }

    [Fact]
    public async Task Should_TellNobody_When_TheApplicationIsNotConfirmedYet()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        await BuildWithDeciderAsync(annaEmail, ct);

        await MembershipApplicationSteps.ApplyAndReadTokenAsync(
            _fixture,
            _fixture.CreateClient(),
            ct
        );

        await _fixture.OutboxDrainedAsync(ct);
        Assert.Empty(await _fixture.Mailbox.MailsToAsync(annaEmail, 0, ct));
    }

    [Fact]
    public async Task Should_TellNobodyAgain_When_TheLinkIsFollowedAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        await BuildWithDeciderAsync(annaEmail, ct);
        var client = _fixture.CreateClient();
        var token = await MembershipApplicationSteps.ApplyAndReadTokenAsync(_fixture, client, ct);
        await MembershipApplicationSteps.ConfirmAsync(client, token);
        await _fixture.Mailbox.SingleMailToAsync(annaEmail, ct);

        await MembershipApplicationSteps.ConfirmAsync(client, token);

        await _fixture.OutboxDrainedAsync(ct);
        Assert.Single(await _fixture.Mailbox.MailsToAsync(annaEmail, 1, ct));
    }

    [Fact]
    public async Task Should_SayItIsAlreadyConfirmed_When_TheLinkIsFollowedAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = _fixture.CreateClient();
        var token = await MembershipApplicationSteps.ApplyAndReadTokenAsync(_fixture, client, ct);
        await MembershipApplicationSteps.ConfirmAsync(client, token);

        var (response, answer) = await MembershipApplicationSteps.ConfirmAsync(client, token);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MembershipApplicationConfirmation.AlreadyConfirmed, answer.Outcome);
        await ctx.Expected.MembershipApplications().ToHaveConfirmedCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ConfirmTheApplication_When_TheLinkIsFollowedJustBefore48Hours()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = _fixture.CreateClient();
        var token = await MembershipApplicationSteps.ApplyAndReadTokenAsync(_fixture, client, ct);

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromHours(48) - TimeSpan.FromSeconds(1),
            async () =>
            {
                var (response, answer) = await MembershipApplicationSteps.ConfirmAsync(
                    client,
                    token
                );

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.Equal(MembershipApplicationConfirmation.Confirmed, answer.Outcome);
            }
        );
        await ctx.Expected.MembershipApplications().ToHaveConfirmedCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AnswerGone_When_TheLinkIsFollowedAfter48Hours()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = _fixture.CreateClient();
        var token = await MembershipApplicationSteps.ApplyAndReadTokenAsync(_fixture, client, ct);

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromHours(48),
            async () =>
            {
                var (response, _) = await MembershipApplicationSteps.ConfirmAsync(client, token);

                Assert.Equal(HttpStatusCode.Gone, response.StatusCode);
            }
        );
        await ctx.Expected.MembershipApplications().ToHaveConfirmedCount(0).AssertAsync(ct);
    }

    [Theory]
    [InlineData("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")]
    [InlineData("kein-token")]
    public async Task Should_AnswerGone_When_TheTokenBelongsToNoApplication(string token)
    {
        await _fixture.BuildAsync(TestContext.Current.CancellationToken);

        var (response, _) = await MembershipApplicationSteps.ConfirmAsync(
            _fixture.CreateClient(),
            token
        );

        Assert.Equal(HttpStatusCode.Gone, response.StatusCode);
    }
}
