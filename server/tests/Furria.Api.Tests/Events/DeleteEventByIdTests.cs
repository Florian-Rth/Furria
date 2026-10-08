using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Events;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Events;

[Collection("Api")]
public sealed class DeleteEventByIdTests
{
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

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

    private readonly ApiTestFixture _fixture;

    public DeleteEventByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RemoveTheEventAndItsCalendarEntry_When_TheKeyHolderDeletesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var eventId = ctx.Club.Events.IdOf("first-gala");

        var response = await DeleteAsync(ctx, "vera", eventId);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Event(eventId)
            .ToNotExist()
            .CalendarEntry(eventId)
            .ToNotExist()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheDeletionNamingTheCount_When_TicketRequestsAreOpen()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(
            ct,
            club =>
                club.AddTicketRequest("mia-gala", "first-gala", "Mia Gast", "mia@guest.test")
                    .AddTicketRequest("ole-gala", "first-gala", "Ole Gast", "ole@guest.test")
        );
        var eventId = ctx.Club.Events.IdOf("first-gala");

        var response = await DeleteAsync(ctx, "vera", eventId);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        Assert.Equal(
            [
                "Zu dieser Veranstaltung sind noch 2 Kartenanfragen offen. Erledige sie, bevor du die Veranstaltung löschst.",
            ],
            failures!.Errors["conflict"]
        );
        await ctx
            .Expected.Event(eventId)
            .ToHaveTeaser("Der Abend, auf den die Session hinfiebert.")
            .TicketRequests()
            .ToHaveCount(2)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheIdNamesACalendarEntryOfAnotherKind()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var meetingId = ctx.Club.CalendarEntries.IdOf("club-meeting");

        var response = await DeleteAsync(ctx, "vera", meetingId);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx.Expected.CalendarEntry(meetingId).ToHaveTitle("Vereinssitzung").AssertAsync(ct);
    }

    private static async Task<HttpResponseMessage> DeleteAsync(
        SeededContext ctx,
        string alias,
        int eventId
    )
    {
        var client = await ctx.Identity.ClientForAsync(
            alias,
            TestContext.Current.CancellationToken
        );
        return await client.DELETEAsync<DeleteEventById, DeleteEventByIdRequest>(
            new() { EventId = eventId }
        );
    }

    private Task<SeededContext> BuildClubAsync(
        CancellationToken ct,
        Action<ClubSeedBuilder>? arrangeRequests = null
    ) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("vera", "Vera", "Anstalter")
                            .AddAccount("vera")
                            .AddMembership("vera-first", "vera", JoinedIn2017)
                            .AddPerson("max", "Max", "Mitglied")
                            .AddAccount("max")
                            .AddMembership("max-first", "max", JoinedIn2017)
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "veranstaltungen",
                            "vera-veranstaltungen",
                            "Veranstaltungen",
                            "vera",
                            FurriaPermissions.EventsManage
                        )
                    )
                    .Club(club =>
                    {
                        club.AddVenue("buergerhaus", "Bürgerhaus")
                            .AddEvent(
                                "first-gala",
                                "1. Prunksitzung",
                                AtTheFirstGala,
                                "buergerhaus"
                            )
                            .AddCalendarEntry("club-meeting", "Vereinssitzung", AtTheMeeting);
                        arrangeRequests?.Invoke(club);
                    }),
            ct
        );
}
