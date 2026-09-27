using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Invitations;
using Furria.Api.Tests.Auth;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Invitations;

[Collection("Api")]
public sealed class GetBulkInvitationPreviewTests
{
    private static readonly DateTimeOffset TheTwentyEighthOfANonLeapFebruary = new(
        2027,
        2,
        28,
        12,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public GetBulkInvitationPreviewTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CountOnlyTheEligible_When_EveryReasonAgainstAnInvitationIsPresent()
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
                        .AddPerson("bea", "Bea", "Muster")
                        .AddPersonContact(
                            "bea",
                            InvitationSteps.UniqueContactEmail("bea"),
                            birthDate: today.AddYears(-16)
                        )
                        .AddMembership("bea-membership", "bea", today.AddYears(-1))
                        .AddPerson("carla", "Carla", "Muster")
                        .AddPersonContact(
                            "carla",
                            InvitationSteps.UniqueContactEmail("carla"),
                            birthDate: today.AddYears(-30)
                        )
                        .AddPerson("dora", "Dora", "Muster")
                        .AddPersonContact("dora", InvitationSteps.UniqueContactEmail("dora"))
                        .AddMembership("dora-membership", "dora", today.AddYears(-1))
                        .AddPerson("emil", "Emil", "Muster")
                        .AddPersonContact(
                            "emil",
                            InvitationSteps.UniqueContactEmail("emil"),
                            birthDate: today.AddYears(-16).AddDays(1)
                        )
                        .AddMembership("emil-membership", "emil", today.AddYears(-1))
                        .AddPerson("fritz", "Fritz", "Muster")
                        .AddPersonContact(
                            "fritz",
                            birthDate: today.AddYears(-30),
                            withoutEmail: true
                        )
                        .AddMembership("fritz-membership", "fritz", today.AddYears(-1))
                        .AddEligiblePerson(
                            "gina",
                            "Gina",
                            InvitationSteps.UniqueContactEmail("gina"),
                            today
                        )
                        .AddAccount("gina")
                ),
            ct
        );

        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var preview = await InvitationRoundSteps.PreviewAsync(manager);

        Assert.Equal(2, preview.InviteCount);
        Assert.Equal(0, preview.RemindCount);
        Assert.Equal(1, preview.EligibleWithoutEmailCount);
    }

    [Fact]
    public async Task Should_CountHerAsOfAge_When_SheWasBornOnALeapDayAndHerBirthdayFallsOnTheTwentyEighth()
    {
        var ct = TestContext.Current.CancellationToken;
        var bornOnALeapDay = new DateOnly(2012, 2, 29);
        var bornADayLater = bornOnALeapDay.AddDays(1);

        await _fixture.AtInstantAsync(
            TheTwentyEighthOfANonLeapFebruary,
            async () =>
            {
                var today = _fixture.Today;
                var ctx = await _fixture.BuildAsync(
                    builder =>
                        builder
                            .Identity(identity =>
                                identity
                                    .AddPerson("anna", "Anna", "Muster")
                                    .AddPersonContact(
                                        "anna",
                                        InvitationSteps.UniqueContactEmail("anna"),
                                        birthDate: bornOnALeapDay
                                    )
                                    .AddMembership("anna-membership", "anna", today.AddYears(-1))
                                    .AddPerson("bea", "Bea", "Muster")
                                    .AddPersonContact(
                                        "bea",
                                        InvitationSteps.UniqueContactEmail("bea"),
                                        birthDate: bornADayLater
                                    )
                                    .AddMembership("bea-membership", "bea", today.AddYears(-1))
                            )
                            .Club(club => club.SetClubRecord(ageOfConsent: 15)),
                    ct
                );

                var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
                var preview = await InvitationRoundSteps.PreviewAsync(manager);

                Assert.Equal(1, preview.InviteCount);
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutEveryoneAlreadyInvited_When_SomeInvitationsAreOpen()
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
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        await InvitationSteps.InviteAsync(manager, ctx.Identity.People.IdOf("anna"));

        var preview = await InvitationRoundSteps.PreviewAsync(manager);

        Assert.Equal(1, preview.InviteCount);
        Assert.Equal(0, preview.RemindCount);
    }

    [Fact]
    public async Task Should_CountAnOpenInvitationForAReminder_When_ItWasIssuedMoreThanThreeDaysAgo()
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
        await InvitationSteps.InviteAsync(manager, ctx.Identity.People.IdOf("anna"));

        await _fixture.AtLaterTimeAsync(
            InvitationRoundSteps.PastTheReminderDelay,
            async () =>
            {
                var laterManager = await ctx.Identity.BootstrapAdminClientAsync(ct);
                var preview = await InvitationRoundSteps.PreviewAsync(laterManager);

                Assert.Equal(0, preview.InviteCount);
                Assert.Equal(1, preview.RemindCount);
            }
        );
    }

    [Fact]
    public async Task Should_CountAnExpiredOpenInvitationForAReminder_When_ItWasNeverRedeemedOrVoided()
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
        await InvitationSteps.InviteAsync(manager, ctx.Identity.People.IdOf("anna"));

        await _fixture.AtLaterTimeAsync(
            InvitationRoundSteps.PastTheMailLifetime,
            async () =>
            {
                var laterManager = await ctx.Identity.BootstrapAdminClientAsync(ct);
                var preview = await InvitationRoundSteps.PreviewAsync(laterManager);

                Assert.Equal(0, preview.InviteCount);
                Assert.Equal(1, preview.RemindCount);
            }
        );
    }

    [Fact]
    public async Task Should_NotCountAReminder_When_SheIsNoLongerEligible()
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
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        await InvitationSteps.InviteAsync(manager, ctx.Identity.People.IdOf("anna"));

        await _fixture.AtLaterTimeAsync(
            InvitationRoundSteps.PastTheReminderDelay,
            async () =>
            {
                var laterManager = await ctx.Identity.BootstrapAdminClientAsync(ct);
                var preview = await InvitationRoundSteps.PreviewAsync(laterManager);

                Assert.Equal(0, preview.RemindCount);
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
        var (response, _) = await client.GETAsync<
            GetBulkInvitationPreview,
            GetBulkInvitationPreviewResponse
        >();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture
            .CreateClient()
            .GETAsync<GetBulkInvitationPreview, GetBulkInvitationPreviewResponse>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
