using System.Net;
using Furria.Api.RateLimiting;
using Furria.Api.Tests.Auth;
using Furria.Application.Authorization;
using Furria.Core.Events;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.TicketRequests;

[Collection("Api")]
public sealed class PostTicketRequestTests
{
    private const string ConflictField = "conflict";
    private const string WindowClosedMessage =
        "Für diese Veranstaltung nehmen wir gerade keine Kartenanfragen an.";

    private static readonly DateTimeOffset Now = new(2027, 1, 10, 12, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset AtTheFirstGala = new(
        2027,
        1,
        16,
        18,
        11,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheMeeting = new(2027, 1, 20, 19, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset PresaleStarted = new(
        2026,
        12,
        1,
        9,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset PresaleAhead = new(2027, 1, 12, 9, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public PostTicketRequestTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_KeepTheRequestAndMailTheGuestAReceipt_When_ItArrivesWhileThePresaleRuns()
    {
        var ct = TestContext.Current.CancellationToken;
        var email = InvitationSteps.UniqueContactEmail("mia");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);
                var eventId = ctx.Club.Events.IdOf("first-gala");

                var response = await TicketRequestSteps.RequestAsync(
                    _fixture.CreateClient(),
                    TicketRequestSteps.RequestOf(eventId, email)
                );

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.Equal("{}", await response.Content.ReadAsStringAsync(ct));
                await ctx
                    .Expected.TicketRequests()
                    .ToHoldOnly(
                        new TicketRequest
                        {
                            EventId = eventId,
                            TicketCount = 4,
                            Name = TicketRequestSteps.GuestName,
                            Phone = TicketRequestSteps.GuestPhone,
                            Email = email,
                            Message = TicketRequestSteps.GuestMessage,
                            RequestedAt = Now,
                        }
                    )
                    .AssertAsync(ct);
                var receipt = await _fixture.Mailbox.SingleMailToAsync(email, ct);
                Assert.Equal(TicketRequestSteps.ReceiptSubject, receipt.Subject);
                Assert.Contains(
                    "deine Kartenanfrage für „1. Prunksitzung“ am 16. Januar – 4 Karten – ist beim Verein. Wir melden uns bei dir.",
                    receipt.Text,
                    StringComparison.Ordinal
                );
            }
        );
    }

    [Fact]
    public async Task Should_RepeatNothingTheGuestTyped_When_TheReceiptIsMailed()
    {
        var ct = TestContext.Current.CancellationToken;
        var email = InvitationSteps.UniqueContactEmail("mia");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);

                await TicketRequestSteps.RequestAsync(
                    _fixture.CreateClient(),
                    TicketRequestSteps.RequestOf(ctx.Club.Events.IdOf("first-gala"), email)
                );

                var receipt = await _fixture.Mailbox.SingleMailToAsync(email, ct);
                foreach (
                    var typed in new[]
                    {
                        TicketRequestSteps.GuestName,
                        TicketRequestSteps.GuestPhone,
                        TicketRequestSteps.GuestMessage,
                    }
                )
                {
                    Assert.DoesNotContain(typed, receipt.Text, StringComparison.Ordinal);
                    Assert.DoesNotContain(typed, receipt.Html, StringComparison.Ordinal);
                }
            }
        );
    }

    [Fact]
    public async Task Should_TellWhoeverHandlesTicketRequests_When_ARequestArrives()
    {
        var ct = TestContext.Current.CancellationToken;
        var tinaEmail = InvitationSteps.UniqueContactEmail("tina");
        var veraEmail = InvitationSteps.UniqueContactEmail("vera");
        var guestEmail = InvitationSteps.UniqueContactEmail("mia");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct, tinaEmail, veraEmail);

                await TicketRequestSteps.RequestAsync(
                    _fixture.CreateClient(),
                    TicketRequestSteps.RequestOf(ctx.Club.Events.IdOf("first-gala"), guestEmail)
                );

                var notice = await _fixture.Mailbox.SingleMailToAsync(tinaEmail, ct);
                Assert.Equal(TicketRequestSteps.ArrivalNoticeSubject, notice.Subject);
                Assert.StartsWith("Hallo Tina,", notice.Text, StringComparison.Ordinal);
                Assert.Contains(
                    "Mia Schwarzwälder bittet um 4 Karten für „1. Prunksitzung“ am 16. Januar.",
                    notice.Text,
                    StringComparison.Ordinal
                );
                Assert.Equal($"{ApiTestFixture.ClubAppBaseUrl}/events", notice.Link());
                await _fixture.OutboxDrainedAsync(ct);
                Assert.Empty(await _fixture.Mailbox.MailsToAsync(veraEmail, 0, ct));
            }
        );
    }

    [Fact]
    public async Task Should_KeepThePhoneTheAddressAndTheMessageOutOfTheNotice_When_ARequestArrives()
    {
        var ct = TestContext.Current.CancellationToken;
        var tinaEmail = InvitationSteps.UniqueContactEmail("tina");
        var guestEmail = InvitationSteps.UniqueContactEmail("mia");

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct, tinaEmail);

                await TicketRequestSteps.RequestAsync(
                    _fixture.CreateClient(),
                    TicketRequestSteps.RequestOf(ctx.Club.Events.IdOf("first-gala"), guestEmail)
                );

                var notice = await _fixture.Mailbox.SingleMailToAsync(tinaEmail, ct);
                foreach (
                    var typed in new[]
                    {
                        guestEmail,
                        TicketRequestSteps.GuestPhone,
                        TicketRequestSteps.GuestMessage,
                    }
                )
                {
                    Assert.DoesNotContain(typed, notice.Subject, StringComparison.Ordinal);
                    Assert.DoesNotContain(typed, notice.Text, StringComparison.Ordinal);
                    Assert.DoesNotContain(typed, notice.Html, StringComparison.Ordinal);
                }
            }
        );
    }

    [Fact]
    public async Task Should_AcceptTheRequest_When_FewTicketsAreLeftAndItCarriesNoMessage()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);

                var response = await TicketRequestSteps.RequestAsync(
                    _fixture.CreateClient(),
                    TicketRequestSteps.RequestOf(
                        ctx.Club.Events.IdOf("few-left"),
                        InvitationSteps.UniqueContactEmail("mia")
                    ) with
                    {
                        Message = " ",
                    }
                );

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                await ctx.Expected.TicketRequests().ToHaveCount(1).AssertAsync(ct);
            }
        );
    }

    [Theory]
    [InlineData("announced")]
    [InlineData("presale-ahead")]
    [InlineData("sold-out")]
    [InlineData("cancelled")]
    public async Task Should_RefuseTheRequest_When_TheEventTakesNoRequestsNow(string eventAlias)
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);

                var response = await TicketRequestSteps.RequestAsync(
                    _fixture.CreateClient(),
                    TicketRequestSteps.RequestOf(
                        ctx.Club.Events.IdOf(eventAlias),
                        InvitationSteps.UniqueContactEmail("mia")
                    )
                );

                Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
                Assert.Equal(
                    [WindowClosedMessage],
                    (await TicketRequestSteps.FailuresAsync(response, ct))[ConflictField]
                );
                await ctx.Expected.TicketRequests().ToHaveCount(0).AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_RefuseTheRequest_When_TheEveningHasBegun()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            AtTheFirstGala,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);

                var response = await TicketRequestSteps.RequestAsync(
                    _fixture.CreateClient(),
                    TicketRequestSteps.RequestOf(
                        ctx.Club.Events.IdOf("first-gala"),
                        InvitationSteps.UniqueContactEmail("mia")
                    )
                );

                Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
                await ctx.Expected.TicketRequests().ToHaveCount(0).AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheIdNamesACalendarEntryOfAnotherKind()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);

                var response = await TicketRequestSteps.RequestAsync(
                    _fixture.CreateClient(),
                    TicketRequestSteps.RequestOf(
                        ctx.Club.CalendarEntries.IdOf("club-meeting"),
                        InvitationSteps.UniqueContactEmail("mia")
                    )
                );

                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
                await ctx.Expected.TicketRequests().ToHaveCount(0).AssertAsync(ct);
            }
        );
    }

    [Theory]
    [InlineData("")]
    [InlineData("bm8tY2hhbGxlbmdl")]
    public async Task Should_RefuseTheRequest_When_NoSolvedChallengeComesWithIt(string altcha)
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);

                var response = await TicketRequestSteps.SubmitAsync(
                    _fixture.CreateClient(),
                    TicketRequestSteps.RequestOf(
                        ctx.Club.Events.IdOf("first-gala"),
                        InvitationSteps.UniqueContactEmail("mia")
                    ) with
                    {
                        Altcha = altcha,
                    }
                );

                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
                Assert.Equal(
                    ["altcha"],
                    (await TicketRequestSteps.FailuresAsync(response, ct)).Keys
                );
                await ctx.Expected.TicketRequests().ToHaveCount(0).AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_NameEveryRefusedField_When_TheFormArrivesIncomplete()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);

                var response = await TicketRequestSteps.RequestAsync(
                    _fixture.CreateClient(),
                    TicketRequestSteps.RequestOf(
                        ctx.Club.Events.IdOf("first-gala"),
                        "mia-at-web"
                    ) with
                    {
                        TicketCount = 11,
                        Name = " ",
                        Phone = "kein Telefon",
                        Message = new string('x', 501),
                        ConsentAccepted = false,
                    }
                );

                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
                Assert.Equal(
                    ["consentAccepted", "email", "message", "name", "phone", "ticketCount"],
                    (await TicketRequestSteps.FailuresAsync(response, ct)).Keys.Order(
                        StringComparer.Ordinal
                    )
                );
                await ctx.Expected.TicketRequests().ToHaveCount(0).AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnTooManyRequests_When_OneAddressRequestsTooOften()
    {
        var ct = TestContext.Current.CancellationToken;
        var email = InvitationSteps.UniqueContactEmail("mia");
        var permits = new SignedOutRateLimitOptions().PermitsPerAddress;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);
                var client = _fixture.CreateClient();
                var request = TicketRequestSteps.RequestOf(
                    ctx.Club.Events.IdOf("first-gala"),
                    email
                );

                for (var attempt = 0; attempt < permits; attempt++)
                    Assert.Equal(
                        HttpStatusCode.OK,
                        (await TicketRequestSteps.RequestAsync(client, request)).StatusCode
                    );
                var refused = await TicketRequestSteps.RequestAsync(client, request);

                Assert.Equal(HttpStatusCode.TooManyRequests, refused.StatusCode);
                await ctx.Expected.TicketRequests().ToHaveCount(permits).AssertAsync(ct);
            }
        );
    }

    private Task<SeededContext> BuildClubAsync(
        CancellationToken ct,
        string? tinaEmail = null,
        string? veraEmail = null
    ) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("tina", "Tina", "Kartenanfragen")
                            .AddPersonContact(
                                "tina",
                                tinaEmail ?? InvitationSteps.UniqueContactEmail("tina")
                            )
                            .AddPerson("vera", "Vera", "Anstalter")
                            .AddPersonContact(
                                "vera",
                                veraEmail ?? InvitationSteps.UniqueContactEmail("vera")
                            )
                    )
                    .Roles(roles =>
                        roles
                            .AddRoleWithHolder(
                                "kartenanfragen",
                                "tina-kartenanfragen",
                                "Kartenanfragen",
                                "tina",
                                FurriaPermissions.TicketRequestsHandle
                            )
                            .AddRoleWithHolder(
                                "veranstaltungen",
                                "vera-veranstaltungen",
                                "Veranstaltungen",
                                "vera",
                                FurriaPermissions.EventsManage
                            )
                    )
                    .Club(club =>
                        club.AddVenue("buergerhaus", "Bürgerhaus")
                            .AddEvent(
                                "first-gala",
                                "1. Prunksitzung",
                                AtTheFirstGala,
                                "buergerhaus",
                                presaleStartsAt: PresaleStarted
                            )
                            .AddEvent(
                                "few-left",
                                "2. Prunksitzung",
                                AtTheFirstGala.AddDays(7),
                                "buergerhaus",
                                presaleStartsAt: PresaleStarted,
                                ticketAvailability: TicketAvailability.FewLeft
                            )
                            .AddEvent(
                                "announced",
                                "Kinderfasching",
                                AtTheFirstGala.AddDays(14),
                                "buergerhaus"
                            )
                            .AddEvent(
                                "presale-ahead",
                                "Weiberfastnacht",
                                AtTheFirstGala.AddDays(21),
                                "buergerhaus",
                                presaleStartsAt: PresaleAhead
                            )
                            .AddEvent(
                                "sold-out",
                                "Herrensitzung",
                                AtTheFirstGala.AddDays(1),
                                "buergerhaus",
                                presaleStartsAt: PresaleStarted,
                                ticketAvailability: TicketAvailability.SoldOut
                            )
                            .AddEvent(
                                "cancelled",
                                "Sommerfest",
                                AtTheFirstGala.AddDays(2),
                                "buergerhaus",
                                presaleStartsAt: PresaleStarted,
                                cancelledAt: PresaleStarted
                            )
                            .AddCalendarEntry("club-meeting", "Vereinssitzung", AtTheMeeting)
                    ),
            ct
        );
}
