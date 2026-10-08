using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Events;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Core.Events;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Events;

[Collection("Api")]
public sealed class PostEventTests
{
    private const string ValidationField = "request";
    private const string FirstGala = "1. Prunksitzung";
    private const string Teaser = "Der närrische Höhepunkt der Session.";
    private const string Description = "Garde, Bütt und Elferrat.";
    private const string AgeHint = "ab 16 Jahren";
    private const int PriceCents = 2_200;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly ArchivedIn2026 = new(2026, 6, 30);
    private static readonly TimeOnly DoorsOpenAt = new(17, 30);
    private static readonly TimeOnly DoorsOpenAfterTheStart = new(20, 0);

    private static readonly DateTimeOffset AtTheFirstGala = new(
        2027,
        1,
        16,
        18,
        11,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset FirstGalaEnds = new(
        2027,
        1,
        17,
        0,
        30,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheRehearsal = new(
        2027,
        1,
        16,
        14,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset RehearsalEnds = new(
        2027,
        1,
        16,
        19,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset PresaleStarts = new(2026, 12, 1, 9, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public PostEventTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_WriteAPublicClubEntryOfKindEvent_When_TheKeyHolderCreatesTheEvent()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var venueId = ctx.Club.Venues.IdOf("buergerhaus");

        var (response, result) = await CreateAsync(ctx, "vera", Gala(venueId));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.CalendarEntry(result.EventId)
            .ToHaveTitle(FirstGala)
            .CalendarEntry(result.EventId)
            .ToHaveKind(CalendarEntryKind.Event)
            .CalendarEntry(result.EventId)
            .ToHaveVisibility(CalendarEntryVisibility.Public)
            .CalendarEntry(result.EventId)
            .ToBeClubOwned()
            .CalendarEntry(result.EventId)
            .ToCarryNoParticipatingGroup()
            .CalendarEntry(result.EventId)
            .ToAskForResponse(false)
            .CalendarEntry(result.EventId)
            .ToHaveVenue(venueId)
            .CalendarEntry(result.EventId)
            .ToHavePeriod(AtTheFirstGala, FirstGalaEnds)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheEventsOwnFacts_When_TheKeyHolderCreatesTheEvent()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var (response, result) = await CreateAsync(
            ctx,
            "vera",
            Gala(ctx.Club.Venues.IdOf("buergerhaus"))
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.Event(result.EventId)
            .ToHaveTeaser(Teaser)
            .Event(result.EventId)
            .ToOpenDoorsAt(DoorsOpenAt)
            .Event(result.EventId)
            .ToHaveAgeHint(AgeHint)
            .Event(result.EventId)
            .ToCost(PriceCents)
            .Event(result.EventId)
            .ToStartPresaleAt(PresaleStarts)
            .Event(result.EventId)
            .ToHaveTicketAvailability(TicketAvailability.Available)
            .Event(result.EventId)
            .ToNotBeCancelled()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_WarnAboutTheVenueAndStillWrite_When_AnotherEntryHoldsItAtThatTime()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var (response, result) = await CreateAsync(
            ctx,
            "vera",
            Gala(ctx.Club.Venues.IdOf("buergerhaus"))
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var collision = Assert.Single(result.VenueCollisions);
        Assert.Equal(ctx.Club.CalendarEntries.IdOf("rehearsal"), collision.CalendarEntryId);
        await ctx.Expected.Event(result.EventId).ToHaveTeaser(Teaser).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheVenue_When_ItIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var (response, _) = await CreateAsync(
            ctx,
            "vera",
            Gala(ctx.Club.Venues.IdOf("altes-lager"))
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Ein archivierter Ort kann nicht mehr gewählt werden."],
            failures[ValidationField]
        );
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheDoorsOpenAfterTheStart()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var (response, _) = await CreateAsync(
            ctx,
            "vera",
            Gala(ctx.Club.Venues.IdOf("buergerhaus")) with
            {
                DoorsOpenAt = DoorsOpenAfterTheStart,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheTeaserIsMissing()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var (response, _) = await CreateAsync(
            ctx,
            "vera",
            Gala(ctx.Club.Venues.IdOf("buergerhaus")) with
            {
                Teaser = "",
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_ThePresaleStartsAfterTheEvening()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var (response, _) = await CreateAsync(
            ctx,
            "vera",
            Gala(ctx.Club.Venues.IdOf("buergerhaus")) with
            {
                PresaleStartsAt = FirstGalaEnds,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerOnlyHoldsCalendarManageClub()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var (response, _) = await CreateAsync(
            ctx,
            "ilka",
            Gala(ctx.Club.Venues.IdOf("buergerhaus"))
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    private static PostEventRequest Gala(int venueId) =>
        new()
        {
            Title = FirstGala,
            StartsAt = AtTheFirstGala,
            EndsAt = FirstGalaEnds,
            DoorsOpenAt = DoorsOpenAt,
            VenueId = venueId,
            Teaser = Teaser,
            Description = Description,
            AgeHint = AgeHint,
            PriceCents = PriceCents,
            PresaleStartsAt = PresaleStarts,
        };

    private static async Task<TestResult<PostEventResponse>> CreateAsync(
        SeededContext ctx,
        string alias,
        PostEventRequest request
    )
    {
        var client = await ctx.Identity.ClientForAsync(
            alias,
            TestContext.Current.CancellationToken
        );
        return await client.POSTAsync<PostEvent, PostEventRequest, PostEventResponse>(request);
    }

    private Task<SeededContext> BuildClubAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("vera", "Vera", "Anstalter")
                            .AddAccount("vera")
                            .AddMembership("vera-first", "vera", JoinedIn2017)
                            .AddPerson("ilka", "Ilka", "Kalender")
                            .AddAccount("ilka")
                            .AddMembership("ilka-first", "ilka", JoinedIn2017)
                    )
                    .Roles(roles =>
                        roles
                            .AddRoleWithHolder(
                                "veranstaltungen",
                                "vera-veranstaltungen",
                                "Veranstaltungen",
                                "vera",
                                FurriaPermissions.EventsManage
                            )
                            .AddRoleWithHolder(
                                "terminpflege",
                                "ilka-terminpflege",
                                "Terminpflege",
                                "ilka",
                                FurriaPermissions.CalendarManageClub
                            )
                    )
                    .Club(club =>
                        club.AddVenue("buergerhaus", "Bürgerhaus")
                            .AddVenue("altes-lager", "Altes Lager", archivedOn: ArchivedIn2026)
                            .AddCalendarEntry(
                                "rehearsal",
                                "Generalprobe",
                                AtTheRehearsal,
                                RehearsalEnds,
                                kind: CalendarEntryKind.Rehearsal,
                                venueAlias: "buergerhaus"
                            )
                    ),
            ct
        );

    private static async Task<IDictionary<string, List<string>>> ReadFailuresAsync(
        HttpResponseMessage response,
        CancellationToken ct
    )
    {
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        return payload?.Errors
            ?? throw new InvalidOperationException("The failure response carried no errors.");
    }
}
