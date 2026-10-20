using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Events;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Events;

public sealed class PutEventPublishedTests : IClassFixture<ApiTestFixture>
{
    private const string ConflictField = "conflict";
    private const string Description = "Garde, Bütt und Elferrat.";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly TimeOnly DoorsOpenAt = new(17, 30);

    private static readonly DateTimeOffset Now = new(2027, 1, 10, 12, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset AtTheGala = new(2027, 1, 16, 18, 11, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset AtLastWeeksGala = new(
        2027,
        1,
        3,
        18,
        11,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public PutEventPublishedTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_PublishTheEvent_When_EveryDetailIsSet()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);
                var eventId = await WithPictureAsync(ctx, "gala", ct);

                var response = await PublishAsync(ctx, eventId);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
                await ctx.Expected.Event(eventId).ToBePublishedAt(Now).AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnConflictNamingTheGaps_When_DetailsAreMissing()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);
                var eventId = ctx.Club.Events.IdOf("bare-gala");

                var response = await PublishAsync(ctx, eventId);

                Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
                var failures = await ReadFailuresAsync(response, ct);
                Assert.Equal(
                    ["Für die Veröffentlichung fehlen noch: Einlass, Beschreibung, Bild."],
                    failures[ConflictField]
                );
                await ctx.Expected.Event(eventId).ToBeUnpublished().AssertAsync(ct);
            }
        );
    }

    [Theory]
    [InlineData("cancelled-gala", "Eine abgesagte Veranstaltung wird nicht veröffentlicht.")]
    [InlineData("past-gala", "Diese Veranstaltung ist schon vorbei.")]
    [InlineData("published-gala", "Diese Veranstaltung ist bereits veröffentlicht.")]
    public async Task Should_ReturnConflict_When_TheEventCannotBePublishedAnymore(
        string alias,
        string expected
    )
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);
                var eventId = await WithPictureAsync(ctx, alias, ct);

                var response = await PublishAsync(ctx, eventId);

                Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
                var failures = await ReadFailuresAsync(response, ct);
                Assert.Equal([expected], failures[ConflictField]);
            }
        );
    }

    private async Task<int> WithPictureAsync(SeededContext ctx, string alias, CancellationToken ct)
    {
        var eventId = ctx.Club.Events.IdOf(alias);
        var client = await ctx.Identity.ClientForAsync("vera", ct);
        await EventPictureSteps.UploadAsync(client, eventId, ct);
        return eventId;
    }

    private static async Task<HttpResponseMessage> PublishAsync(SeededContext ctx, int eventId)
    {
        var client = await ctx.Identity.ClientForAsync(
            "vera",
            TestContext.Current.CancellationToken
        );
        return await client.PUTAsync<PutEventPublished, PutEventPublishedRequest>(
            new() { EventId = eventId }
        );
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
                        club.AddVenue("buergerhaus", "Bürgerhaus")
                            .AddEvent(
                                "gala",
                                "1. Prunksitzung",
                                AtTheGala,
                                "buergerhaus",
                                doorsOpenAt: DoorsOpenAt,
                                description: Description,
                                unpublished: true
                            )
                            .AddEvent(
                                "bare-gala",
                                "2. Prunksitzung",
                                AtTheGala.AddDays(1),
                                "buergerhaus",
                                unpublished: true
                            )
                            .AddEvent(
                                "cancelled-gala",
                                "3. Prunksitzung",
                                AtTheGala.AddDays(2),
                                "buergerhaus",
                                doorsOpenAt: DoorsOpenAt,
                                description: Description,
                                cancelledAt: Now.AddDays(-1),
                                unpublished: true
                            )
                            .AddEvent(
                                "past-gala",
                                "Neujahrsempfang",
                                AtLastWeeksGala,
                                "buergerhaus",
                                doorsOpenAt: DoorsOpenAt,
                                description: Description,
                                unpublished: true
                            )
                            .AddEvent(
                                "published-gala",
                                "4. Prunksitzung",
                                AtTheGala.AddDays(3),
                                "buergerhaus",
                                doorsOpenAt: DoorsOpenAt,
                                description: Description
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
