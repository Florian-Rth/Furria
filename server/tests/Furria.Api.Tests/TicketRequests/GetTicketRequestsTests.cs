using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.TicketRequests;
using Furria.Application.Authorization;
using Furria.Application.Management;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.TicketRequests;

public sealed class GetTicketRequestsTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset AtTheFirstGala = new(
        2027,
        1,
        16,
        18,
        11,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheSecondGala = new(
        2027,
        1,
        23,
        18,
        11,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset FirstMorning = new(2027, 1, 5, 9, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset SecondMorning = new(2027, 1, 6, 9, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public GetTicketRequestsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListTheOpenRequestsByEveningThenArrival_When_TheHandlerReadsThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(
            club =>
                club.AddTicketRequest(
                        "ole-second",
                        "second-gala",
                        "Ole Gast",
                        "ole@guest.test",
                        requestedAt: FirstMorning
                    )
                    .AddTicketRequest(
                        "mia-first",
                        "first-gala",
                        "Mia Gast",
                        "mia@guest.test",
                        ticketCount: 4,
                        phone: "0221 987654",
                        message: "Gern nah an der Bühne.",
                        requestedAt: SecondMorning
                    )
                    .AddTicketRequest(
                        "ida-first",
                        "first-gala",
                        "Ida Gast",
                        "ida@guest.test",
                        requestedAt: FirstMorning
                    ),
            ct
        );

        var (response, result) = await ReadAsync(ctx, "tina");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [
                ctx.Club.TicketRequests.IdOf("ida-first"),
                ctx.Club.TicketRequests.IdOf("mia-first"),
                ctx.Club.TicketRequests.IdOf("ole-second"),
            ],
            result.TicketRequests.Select(request => request.TicketRequestId)
        );
        var mia = result.TicketRequests[1];
        Assert.Equal(ctx.Club.Events.IdOf("first-gala"), mia.EventId);
        Assert.Equal("1. Prunksitzung", mia.EventTitle);
        Assert.Equal(AtTheFirstGala, mia.EventStartsAt);
        Assert.Equal(4, mia.TicketCount);
        Assert.Equal("Mia Gast", mia.Name);
        Assert.Equal("0221 987654", mia.Phone);
        Assert.Equal("mia@guest.test", mia.Email);
        Assert.Equal("Gern nah an der Bühne.", mia.Message);
        Assert.Equal(SecondMorning, mia.RequestedAt);
    }

    [Fact]
    public async Task Should_CarryTheWaitingToDo_When_RequestsAreOpen()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(
            club =>
                club.AddTicketRequest("mia-first", "first-gala", "Mia Gast", "mia@guest.test")
                    .AddTicketRequest("ole-second", "second-gala", "Ole Gast", "ole@guest.test"),
            ct
        );

        var (_, result) = await ReadAsync(ctx, "tina");

        Assert.NotNull(result.ToDo);
        Assert.Equal(ToDoKind.TicketRequestWaiting, result.ToDo.Kind);
        Assert.Equal(2, result.ToDo.Count);
        Assert.False(result.ToDo.IsSeen);
        Assert.NotEmpty(result.ToDo.Version);
    }

    [Fact]
    public async Task Should_CarryNoToDo_When_NoRequestIsOpen()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(_ => { }, ct);

        var (response, result) = await ReadAsync(ctx, "tina");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(result.TicketRequests);
        Assert.Null(result.ToDo);
    }

    private static async Task<TestResult<GetTicketRequestsResponse>> ReadAsync(
        SeededContext ctx,
        string alias
    )
    {
        var client = await ctx.Identity.ClientForAsync(
            alias,
            TestContext.Current.CancellationToken
        );
        return await client.GETAsync<GetTicketRequests, GetTicketRequestsResponse>();
    }

    private Task<SeededContext> BuildClubAsync(
        Action<ClubSeedBuilder> arrangeRequests,
        CancellationToken ct
    ) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("tina", "Tina", "Kartenanfragen")
                            .AddAccount("tina")
                            .AddPerson("vera", "Vera", "Anstalter")
                            .AddAccount("vera")
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
                    {
                        club.AddVenue("buergerhaus", "Bürgerhaus")
                            .AddEvent(
                                "first-gala",
                                "1. Prunksitzung",
                                AtTheFirstGala,
                                "buergerhaus"
                            )
                            .AddEvent(
                                "second-gala",
                                "2. Prunksitzung",
                                AtTheSecondGala,
                                "buergerhaus"
                            );
                        arrangeRequests(club);
                    }),
            ct
        );
}
