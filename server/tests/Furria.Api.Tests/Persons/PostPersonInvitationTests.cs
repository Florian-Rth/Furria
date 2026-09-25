using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Api.Endpoints.Persons;
using Furria.Api.Tests.Auth;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

[Collection("Api")]
public sealed class PostPersonInvitationTests
{
    private const string ConflictField = "conflict";
    private const int UnknownPersonId = 999_999;

    private readonly ApiTestFixture _fixture;

    public PostPersonInvitationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_MailTheInvitationToHerContactEmail_When_SheIsEligible()
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

        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var issued = await InvitationSteps.InviteAsync(manager, ctx.Identity.People.IdOf("anna"));

        Assert.Equal(_fixture.TimeProvider.GetUtcNow().AddDays(14), issued.ExpiresAt);
        var mail = await _fixture.Mailbox.SingleMailToAsync(annaEmail, ct);
        Assert.Equal("Dein Zugang zur Vereins-App", mail.Subject);
        Assert.Contains("Hallo Anna,", mail.Text, StringComparison.Ordinal);
        Assert.StartsWith(
            $"{ApiTestFixture.ClubAppBaseUrl}/invitation#token=",
            mail.Link(),
            StringComparison.Ordinal
        );
        await ctx
            .Expected.InvitationsOfPerson(ctx.Identity.People.IdOf("anna"))
            .ToHaveCount(1)
            .InvitationsOfPerson(ctx.Identity.People.IdOf("anna"))
            .ToHaveLiveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KillTheFirstLink_When_ASecondInvitationIsIssued()
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
        await InvitationSteps.InviteAsync(manager, annaId);

        var mails = await _fixture.Mailbox.MailsToAsync(annaEmail, 2, ct);
        var anonymous = _fixture.CreateClient();
        var (_, first) = await InvitationSteps.LookUpAsync(anonymous, mails[0].LinkToken());
        var (_, second) = await InvitationSteps.LookUpAsync(anonymous, mails[1].LinkToken());
        Assert.Equal(InvitationLookupStatus.Dead, first.Status);
        Assert.Equal(InvitationLookupStatus.Live, second.Status);
        await ctx
            .Expected.InvitationsOfPerson(annaId)
            .ToHaveCount(2)
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_VoidAnExpiredInvitation_When_ANewOneIsIssued()
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
            TimeSpan.FromDays(20),
            async () =>
            {
                var laterManager = await ctx.Identity.BootstrapAdminClientAsync(ct);
                await InvitationSteps.InviteAsync(laterManager, annaId);
            }
        );

        await ctx
            .Expected.InvitationsOfPerson(annaId)
            .ToHaveCount(2)
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_SheIsNotAffiliated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("anna", "Anna", "Muster")
                        .AddPersonContact(
                            "anna",
                            InvitationSteps.UniqueContactEmail("anna"),
                            birthDate: _fixture.Today.AddYears(-30)
                        )
                ),
            ct
        );

        await AssertRefusedAsync(ctx, "anna", "Anna ist nicht im Verein aktiv.", ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_HerBirthDateIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("anna", "Anna", "Muster")
                        .AddPersonContact("anna", InvitationSteps.UniqueContactEmail("anna"))
                        .AddMembership("anna-membership", "anna", _fixture.Today.AddYears(-1))
                ),
            ct
        );

        await AssertRefusedAsync(ctx, "anna", "Für Anna ist kein Geburtsdatum hinterlegt.", ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_SheIsYoungerThanTheAgeOfConsent()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Muster")
                            .AddPersonContact(
                                "anna",
                                InvitationSteps.UniqueContactEmail("anna"),
                                birthDate: _fixture.Today.AddYears(-18).AddDays(1)
                            )
                            .AddMembership("anna-membership", "anna", _fixture.Today.AddYears(-1))
                    )
                    .Club(club => club.SetClubRecord(ageOfConsent: 18)),
            ct
        );

        await AssertRefusedAsync(ctx, "anna", "Anna ist noch nicht 18.", ct);
    }

    [Fact]
    public async Task Should_IssueTheInvitation_When_SheTurnsTheAgeOfConsentToday()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("anna", "Anna", "Muster")
                        .AddPersonContact(
                            "anna",
                            annaEmail,
                            birthDate: _fixture.Today.AddYears(-16)
                        )
                        .AddMembership("anna-membership", "anna", _fixture.Today.AddYears(-1))
                ),
            ct
        );

        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        await InvitationSteps.InviteAsync(manager, ctx.Identity.People.IdOf("anna"));

        await _fixture.Mailbox.SingleMailToAsync(annaEmail, ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_SheHasNoEmail()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("anna", "Anna", "Muster")
                        .AddPersonContact(
                            "anna",
                            birthDate: _fixture.Today.AddYears(-30),
                            withoutEmail: true
                        )
                        .AddMembership("anna-membership", "anna", _fixture.Today.AddYears(-1))
                ),
            ct
        );

        await AssertRefusedAsync(ctx, "anna", "Für Anna ist keine E-Mail-Adresse hinterlegt.", ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_SheAlreadyHasAnAccount()
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
                        .AddAccount("anna")
                ),
            ct
        );

        await AssertRefusedAsync(ctx, "anna", "Anna hat bereits einen Zugang.", ct);
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
                            .AddPerson("ilka", "Ilka", "Reineke")
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
            PostPersonInvitation,
            PostPersonInvitationRequest,
            PostPersonInvitationResponse
        >(new PostPersonInvitationRequest { PersonId = ctx.Identity.People.IdOf("anna") });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.InvitationsOfPerson(ctx.Identity.People.IdOf("anna"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePersonIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await manager.POSTAsync<
            PostPersonInvitation,
            PostPersonInvitationRequest,
            PostPersonInvitationResponse
        >(new PostPersonInvitationRequest { PersonId = UnknownPersonId });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static async Task AssertRefusedAsync(
        SeededContext ctx,
        string alias,
        string expectedMessage,
        CancellationToken ct
    )
    {
        var personId = ctx.Identity.People.IdOf(alias);
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);

        var (response, _) = await manager.POSTAsync<
            PostPersonInvitation,
            PostPersonInvitationRequest,
            PostPersonInvitationResponse
        >(new PostPersonInvitationRequest { PersonId = personId });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        Assert.Equal([expectedMessage], payload?.Errors[ConflictField]);
        await ctx.Expected.InvitationsOfPerson(personId).ToHaveCount(0).AssertAsync(ct);
    }
}
