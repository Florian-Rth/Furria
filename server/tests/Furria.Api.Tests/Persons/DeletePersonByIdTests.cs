using System.Net;
using System.Net.Http.Headers;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Api.Endpoints.Management;
using Furria.Api.Endpoints.Persons;
using Furria.Api.Tests.Auth;
using Furria.Api.Tests.Media;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Core.Media;
using Furria.Infrastructure.Mail;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Furria.Tests.Common.WebAuthn;
using Xunit;

namespace Furria.Api.Tests.Persons;

public sealed class DeletePersonByIdTests : IClassFixture<ApiTestFixture>
{
    private const string PasswordField = "password";
    private const string PasskeyField = "passkey";
    private const int UnknownPersonId = 999_999;
    private const string PersonErased = "Person {PersonId} erased by person {ActorPersonId}";
    private const string ErasureNoticeSubject = "Deine Daten wurden vom Verein gelöscht";
    private const string ClubName = "KG Rheinfunken";
    private const string ClubStreet = "Vereinsweg 7";
    private const string ClubZip = "50667";
    private const string ClubCity = "Köln";
    private const string ClubEmail = "vorstand@rheinfunken.example";
    private const string ClubPhone = "0221 4711";

    private static readonly DateOnly Joined2012 = new(2012, 11, 11);
    private static readonly DateOnly ArchivedInSpring = new(2026, 4, 2);
    private static readonly DateTimeOffset ChangedInSpring = new(
        2026,
        4,
        2,
        9,
        30,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public DeletePersonByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_EraseHer_When_TheDeleterProvesItWithHerPassword()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangePaulaAndIlkaAsync(ct);
        var paulaId = ctx.Identity.People.IdOf("paula");
        var ilka = await ctx.Identity.ClientForAsync("ilka", ct);

        var response = await DeleteWithPasswordAsync(
            ilka,
            paulaId,
            ApiTestFixture.SeededAccountPassword
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(paulaId)
            .ToNotExist()
            .MembershipsOfPerson(paulaId)
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepHerGalleryUploadsWithNoUploaderAndHerInboxOwnerless_When_SheIsErased()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangePaulaAndIlkaAsync(
            ct,
            builder =>
                builder.Gallery(gallery =>
                    gallery
                        .AddAlbum("gala", "Prunksitzung")
                        .AddGalleryItem("paula-placed", "paula", "gala")
                        .AddGalleryItem("paula-unsorted", "paula")
                )
        );
        var paulaId = ctx.Identity.People.IdOf("paula");
        var ilka = await ctx.Identity.ClientForAsync("ilka", ct);

        var response = await DeleteWithPasswordAsync(
            ilka,
            paulaId,
            ApiTestFixture.SeededAccountPassword
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.GalleryItem(ctx.Gallery.Items.IdOf("paula-unsorted"))
            .ToSitInTheInboxOf(null)
            .GalleryItem(ctx.Gallery.Items.IdOf("paula-placed"))
            .ToBePlacedIn(ctx.Gallery.Albums.IdOf("gala"), _fixture.TimeProvider.GetUtcNow())
            .MediaItem(ctx.Gallery.Items.IdOf("paula-placed"))
            .ToBeUploadedAs(null, "paula-placed.jpg", 4096)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepHerNewsPostsUnsignedAndDropHerMentions_When_SheIsErased()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangePaulaAndIlkaAsync(
            ct,
            builder =>
                builder.News(news =>
                    news.AddNewsPost(
                        "thanks",
                        "Danke",
                        text: "Dank an @[Paula](person:{paula})",
                        authorAlias: "paula"
                    )
                )
        );
        var paulaId = ctx.Identity.People.IdOf("paula");
        var thanksId = ctx.News.Posts.IdOf("thanks");

        await DeleteWithPasswordAsync(
            await ctx.Identity.ClientForAsync("ilka", ct),
            paulaId,
            ApiTestFixture.SeededAccountPassword
        );

        await ctx
            .Expected.NewsPost(thanksId)
            .ToRead("Danke", "", $"Dank an @[Paula](person:{paulaId})", null)
            .NewsPost(thanksId)
            .ToBeAuthoredBy(null)
            .NewsPost(thanksId)
            .ToMention()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_TakeHerPortraitAndItsFilesWithHer_When_SheIsErased()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangePaulaAndIlkaAsync(ct);
        var paulaId = ctx.Identity.People.IdOf("paula");
        var portraitId = await PictureSteps.RenderedPortraitAsync(
            _fixture,
            await ctx.Identity.ManagingLoginClientAsync(ct),
            paulaId,
            ct
        );
        var original = await _fixture.MediaFileOfAsync(portraitId, MediaRendition.Original, ct);

        await DeleteWithPasswordAsync(
            await ctx.Identity.ClientForAsync("ilka", ct),
            paulaId,
            ApiTestFixture.SeededAccountPassword
        );

        await ctx.Expected.MediaItem(portraitId).ToBeGone().AssertAsync(ct);
        Assert.False(File.Exists(original));
    }

    [Fact]
    public async Task Should_RefuseOnThePasswordAndKeepHer_When_ItIsWrong()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangePaulaAndIlkaAsync(ct);
        var paulaId = ctx.Identity.People.IdOf("paula");
        var ilka = await ctx.Identity.ClientForAsync("ilka", ct);

        var response = await DeleteWithPasswordAsync(
            ilka,
            paulaId,
            AccountSecuritySteps.WrongPassword
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AccountSecuritySteps.AssertRefusedOnAsync(response, PasswordField, ct);
        await ctx
            .Expected.Person(paulaId)
            .ToHaveName("Paula", "Brendel")
            .MembershipsOfPerson(paulaId)
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_EraseEveryChainAndUnnameEveryActOfHers_When_HerChainsStillRun()
    {
        var ct = TestContext.Current.CancellationToken;
        var carlaEmail = InvitationSteps.UniqueContactEmail("carla");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("paula")
                            .AddMembership("paula-mitglied", "paula", Joined2012)
                            .AddMembershipPause("paula-ruhe", "paula-mitglied", 2024, 2024)
                            .AddFeeReduction(
                                "paula-ermaessigung",
                                "paula",
                                FeeReductionBasis.Studies,
                                2025,
                                2026
                            )
                            .AddPerson("bert", "Bert", "Muster")
                            .AddMembership("bert-mitglied", "bert")
                            .AddAdmission("bert-mitglied", "paula", ChangedInSpring)
                            .AddContactChange("bert", "paula", ChangedInSpring)
                            .AddPerson("dora", "Dora", "Altmann")
                            .AddArchive("dora", ArchivedInSpring, "paula")
                            .AddEligiblePerson("carla", "Carla", carlaEmail, _fixture.Today)
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddAccount("ilka")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("garde", "Garde")
                            .AddGroupMembership("paula-garde", "garde", "paula")
                            .AddGroupMembership("bert-garde", "garde", "bert")
                            .AddGroupAdmin("paula-garde-admin", "garde", "paula")
                    )
                    .Roles(roles =>
                        roles
                            .AddRoleWithHolder(
                                "pflege",
                                "paula-pflege",
                                "Pflege",
                                "paula",
                                FurriaPermissions.PersonsManage
                            )
                            .AddRoleWithHolder(
                                "loeschen",
                                "ilka-loeschen",
                                "Löschen",
                                "ilka",
                                FurriaPermissions.PersonsDelete
                            )
                    )
                    .Club(club =>
                        club.AddVenue("lager", "Lager")
                            .AddKeyHolding("paula-lager", "lager", "paula")
                            .AddBoardOffice("kasse", "Kassenwart")
                            .AddBoardSeat("paula-kasse", "kasse", "paula")
                            .AddCalendarEntry(
                                "probe",
                                "Probe",
                                _fixture.TimeProvider.GetUtcNow().AddDays(7),
                                asksForResponse: true
                            )
                            .AddAttendanceResponse(
                                "paula-zusage",
                                "probe",
                                "paula",
                                AttendanceAnswer.Yes
                            )
                            .AddAnnouncement("paula-aushang", "paula", "Probe", "Alle kommen.")
                    ),
            ct
        );
        var paulaId = ctx.Identity.People.IdOf("paula");
        var paulaAccountId = ctx.Identity.Accounts.IdOf("paula");
        var paula = await ctx.Identity.ClientForAsync("paula", ct);
        await InvitationSteps.InviteAsync(paula, ctx.Identity.People.IdOf("carla"));
        using var authenticator = new SoftwareAuthenticator();
        await PasskeySteps.RegisterAsync(paula, authenticator);
        var ilka = await ctx.Identity.ClientForAsync("ilka", ct);

        var response = await DeleteWithPasswordAsync(
            ilka,
            paulaId,
            ApiTestFixture.SeededAccountPassword
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(paulaId)
            .ToNotExist()
            .MembershipsOfPerson(paulaId)
            .ToHaveCount(0)
            .FeeReduction(ctx.Identity.FeeReductions.IdOf("paula-ermaessigung"))
            .ToNotExist()
            .GroupMembershipsOf(ctx.Groups.Groups.IdOf("garde"))
            .ToHaveCount(1)
            .GroupAdminsOf(ctx.Groups.Groups.IdOf("garde"))
            .ToHaveCount(0)
            .RoleHoldingsOfPerson(paulaId)
            .ToHaveCount(0)
            .KeyHolding(ctx.Club.KeyHoldings.IdOf("paula-lager"))
            .ToNotExist()
            .BoardSeat(ctx.Club.BoardSeats.IdOf("paula-kasse"))
            .ToNotExist()
            .AttendanceResponsesFor(ctx.Club.CalendarEntries.IdOf("probe"))
            .ToCarryNoAnswerFrom(paulaId)
            .AccountOfPerson(paulaId)
            .ToNotExist()
            .PasskeysOfAccount(paulaAccountId)
            .ToHaveCount(0)
            .RefreshTokensOf(paulaAccountId)
            .ToHaveActiveCount(0)
            .RefreshTokensOf(paulaAccountId)
            .ToHaveRevokedCount(0)
            .Announcement(ctx.Club.Announcements.IdOf("paula-aushang"))
            .ToHaveAuthor(null)
            .Person(ctx.Identity.People.IdOf("bert"))
            .ToHaveContactChangedBy(null, ChangedInSpring)
            .Membership(ctx.Identity.Memberships.IdOf("bert-mitglied"))
            .ToRecordAdmission(null, ChangedInSpring, guardianConsentConfirmed: false)
            .Person(ctx.Identity.People.IdOf("dora"))
            .ToBeArchived(ArchivedInSpring, null)
            .LiveInvitationOfPerson(ctx.Identity.People.IdOf("carla"))
            .ToBeIssuedAs(InvitationChannel.Mail, isReminder: false, issuedByPersonId: null)
            .AccountEventsOfPerson(ctx.Identity.People.IdOf("carla"))
            .ToHaveNoLatestActor()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_TellHerAtHerLoginEmailHowToReachTheClub_When_SheHasAnAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangePaulaAndIlkaAsync(
            ct,
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("paula"))
                    .Club(club =>
                        club.SetClubRecord(
                            name: ClubName,
                            street: ClubStreet,
                            zip: ClubZip,
                            city: ClubCity,
                            email: ClubEmail,
                            phone: ClubPhone
                        )
                    )
        );
        var ilka = await ctx.Identity.ClientForAsync("ilka", ct);

        await DeleteWithPasswordAsync(
            ilka,
            ctx.Identity.People.IdOf("paula"),
            ApiTestFixture.SeededAccountPassword
        );

        var notice = await _fixture.Mailbox.SingleMailToAsync(ctx.Identity.EmailOf("paula"), ct);
        Assert.Equal(ErasureNoticeSubject, notice.Subject);
        Assert.Contains("Hallo Paula,", notice.Text, StringComparison.Ordinal);
        Assert.Contains(
            $"{ClubName} hat deine Daten gelöscht",
            notice.Text,
            StringComparison.Ordinal
        );
        Assert.Contains(ClubEmail, notice.Text, StringComparison.Ordinal);
        Assert.Contains(ClubPhone, notice.Text, StringComparison.Ordinal);
        Assert.Contains(
            $"{ClubStreet}, {ClubZip} {ClubCity}",
            notice.Text,
            StringComparison.Ordinal
        );
        Assert.Contains(ClubEmail, notice.Html, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Should_TellNobody_When_SheHasNoAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var paulaEmail = InvitationSteps.UniqueContactEmail("paula");
        var ctx = await ArrangePaulaAndIlkaAsync(
            ct,
            builder =>
                builder.Identity(identity => identity.AddPersonContact("paula", email: paulaEmail))
        );
        var ilka = await ctx.Identity.ClientForAsync("ilka", ct);

        await DeleteWithPasswordAsync(
            ilka,
            ctx.Identity.People.IdOf("paula"),
            ApiTestFixture.SeededAccountPassword
        );

        await SignedOutMailSteps.SettleAsync(_fixture, ctx.Identity.EmailOf("ilka"), ct);
        Assert.Empty(await SignedOutMailSteps.MailsAlreadyInAsync(_fixture, paulaEmail, ct));
    }

    [Fact]
    public async Task Should_SendHerNoMailStillQueuedForHer_When_SheIsErased()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangePaulaAndIlkaAsync(
            ct,
            builder => builder.Identity(identity => identity.AddAccount("paula"))
        );
        var paulaId = ctx.Identity.People.IdOf("paula");
        await ApiTestFixture.StageOutboxMailAsync(
            _fixture,
            new OutboxMail
            {
                Template = MailTemplate.CredentialChangeNotice,
                RecipientKind = MailRecipientKind.Person,
                RecipientId = paulaId,
                To = ctx.Identity.EmailOf("paula"),
                Subject = "Dein Zugang zur Vereins-App wurde geändert",
                TextBody = "Hallo Paula",
                HtmlBody = "<p>Hallo Paula</p>",
                Attempt = 2,
                NextAttemptAt = _fixture.TimeProvider.GetUtcNow().AddHours(1),
            },
            ct
        );
        var ilka = await ctx.Identity.ClientForAsync("ilka", ct);

        await DeleteWithPasswordAsync(ilka, paulaId, ApiTestFixture.SeededAccountPassword);

        Assert.DoesNotContain(
            await ApiTestFixture.OutboxOfAsync(_fixture, ct),
            mail => mail.Template == MailTemplate.CredentialChangeNotice
        );
    }

    [Fact]
    public async Task Should_LogTheErasureByBothPersonIdsAlone_When_SheIsErased()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangePaulaAndIlkaAsync(ct);
        var ilka = await ctx.Identity.ClientForAsync("ilka", ct);
        var mark = _fixture.Logs.Mark();

        await DeleteWithPasswordAsync(
            ilka,
            ctx.Identity.People.IdOf("paula"),
            ApiTestFixture.SeededAccountPassword
        );

        var written = Assert.Single(_fixture.Logs.Written(PersonErased, mark));
        Assert.Equal(ctx.Identity.People.IdOf("paula"), written.ScalarOf("PersonId"));
        Assert.Equal(ctx.Identity.People.IdOf("ilka"), written.ScalarOf("ActorPersonId"));
    }

    [Fact]
    public async Task Should_EraseHerAndShutHerOut_When_SheDeletesHerself()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangePaulaAndIlkaAsync(
            ct,
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("paula"))
                    .Roles(roles => roles.AddRoleHolding("paula-loeschen", "loeschen", "paula"))
        );
        var paulaId = ctx.Identity.People.IdOf("paula");
        var paulaEmail = ctx.Identity.EmailOf("paula");
        var session = await ctx.Identity.LogInAsync(
            paulaEmail,
            ApiTestFixture.SeededAccountPassword,
            ct
        );
        var paula = ClientCarrying(session.AccessToken);

        var response = await DeleteWithPasswordAsync(
            paula,
            paulaId,
            ApiTestFixture.SeededAccountPassword
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var (meResponse, _) = await paula.GETAsync<GetMe, GetMeResponse>();
        Assert.Equal(HttpStatusCode.Unauthorized, meResponse.StatusCode);
        var (hubResponse, _) = await paula.GETAsync<GetManageHub, GetManageHubResponse>();
        Assert.Equal(HttpStatusCode.Forbidden, hubResponse.StatusCode);
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            (await AccountSecuritySteps.RefreshAsync(_fixture, session.RefreshToken)).StatusCode
        );
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            await AccountSecuritySteps.LogInStatusAsync(
                _fixture,
                paulaEmail,
                ApiTestFixture.SeededAccountPassword
            )
        );
        await ctx.Expected.Person(paulaId).ToNotExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_EraseHer_When_TheDeleterProvesItWithHerPasskey()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangePaulaAndIlkaAsync(ct);
        var paulaId = ctx.Identity.People.IdOf("paula");
        var ilka = await ctx.Identity.ClientForAsync("ilka", ct);
        using var authenticator = new SoftwareAuthenticator();
        await PasskeySteps.RegisterAsync(ilka, authenticator);

        var response = await DeleteWithPasskeyAsync(
            ilka,
            paulaId,
            await PasskeySteps.AssertAsync(_fixture, authenticator)
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx.Expected.Person(paulaId).ToNotExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseOnThePasskeyAndKeepHer_When_TheAssertionIsHersNotTheDeleters()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangePaulaAndIlkaAsync(
            ct,
            builder => builder.Identity(identity => identity.AddAccount("paula"))
        );
        var paulaId = ctx.Identity.People.IdOf("paula");
        using var paulasAuthenticator = new SoftwareAuthenticator();
        await PasskeySteps.RegisterAsync(
            await ctx.Identity.ClientForAsync("paula", ct),
            paulasAuthenticator
        );
        var ilka = await ctx.Identity.ClientForAsync("ilka", ct);

        var response = await DeleteWithPasskeyAsync(
            ilka,
            paulaId,
            await PasskeySteps.AssertAsync(_fixture, paulasAuthenticator)
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AccountSecuritySteps.AssertRefusedOnAsync(response, PasskeyField, ct);
        await ctx.Expected.Person(paulaId).ToExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_EraseHerInNobodysName_When_TheManagingLoginProvesItWithItsPassword()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangePaulaAndIlkaAsync(ct);
        var paulaId = ctx.Identity.People.IdOf("paula");
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        var mark = _fixture.Logs.Mark();

        var response = await DeleteWithPasswordAsync(
            manager,
            paulaId,
            ApiTestFixture.ManagingLoginPassword
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var written = Assert.Single(_fixture.Logs.Written(PersonErased, mark));
        Assert.Null(written.ScalarOf("ActorPersonId"));
        await ctx.Expected.Person(paulaId).ToNotExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbiddenAndKeepHer_When_TheCallerOnlyHoldsPersonsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangePaulaAndIlkaAsync(
            ct,
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("anke", "Anke", "Pfleger").AddAccount("anke")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "pflege",
                            "anke-pflege",
                            "Pflege",
                            "anke",
                            FurriaPermissions.PersonsManage
                        )
                    )
        );
        var paulaId = ctx.Identity.People.IdOf("paula");
        var anke = await ctx.Identity.ClientForAsync("anke", ct);

        var response = await DeleteWithPasswordAsync(
            anke,
            paulaId,
            ApiTestFixture.SeededAccountPassword
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx.Expected.Person(paulaId).ToExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePersonIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangePaulaAndIlkaAsync(ct);
        var ilka = await ctx.Identity.ClientForAsync("ilka", ct);

        var response = await DeleteWithPasswordAsync(
            ilka,
            UnknownPersonId,
            ApiTestFixture.SeededAccountPassword
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private HttpClient ClientCarrying(string accessToken)
    {
        var client = _fixture.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            accessToken
        );
        return client;
    }

    private static async Task<HttpResponseMessage> DeleteWithPasswordAsync(
        HttpClient client,
        int personId,
        string password
    ) =>
        (
            await client.DELETEAsync<DeletePersonById, DeletePersonByIdRequest, EmptyResponse>(
                new DeletePersonByIdRequest { PersonId = personId, Password = password }
            )
        ).Response;

    private static async Task<HttpResponseMessage> DeleteWithPasskeyAsync(
        HttpClient client,
        int personId,
        PasskeyAssertionAttempt attempt
    ) =>
        (
            await client.DELETEAsync<DeletePersonById, DeletePersonByIdRequest, EmptyResponse>(
                new DeletePersonByIdRequest
                {
                    PersonId = personId,
                    Passkey = new DeletePersonByIdPasskeyDto
                    {
                        ChallengeId = attempt.ChallengeId,
                        Credential = attempt.Credential,
                    },
                }
            )
        ).Response;

    private Task<SeededContext> ArrangePaulaAndIlkaAsync(
        CancellationToken ct,
        Action<SeedContextBuilder>? more = null
    ) =>
        _fixture.BuildAsync(
            builder =>
            {
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddMembership("paula-mitglied", "paula", Joined2012)
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddAccount("ilka")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "loeschen",
                            "ilka-loeschen",
                            "Löschen",
                            "ilka",
                            FurriaPermissions.PersonsDelete
                        )
                    );
                more?.Invoke(builder);
            },
            ct
        );
}
