using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.TicketRequests;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.TicketRequests;

[Collection("Api")]
public sealed class DeleteTicketRequestByIdTests
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

    private readonly ApiTestFixture _fixture;

    public DeleteTicketRequestByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_DeleteTheRequest_When_TheHandlerMarksItDone()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var response = await HandleAsync(ctx, "tina", ctx.Club.TicketRequests.IdOf("mia-gala"));

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.TicketRequests()
            .ToHaveIds(ctx.Club.TicketRequests.IdOf("ole-gala"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheRequestIsAlreadyHandled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var requestId = ctx.Club.TicketRequests.IdOf("mia-gala");
        await HandleAsync(ctx, "tina", requestId);

        var response = await HandleAsync(ctx, "tina", requestId);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx.Expected.TicketRequests().ToHaveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerOnlyManagesEvents()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var response = await HandleAsync(ctx, "vera", ctx.Club.TicketRequests.IdOf("mia-gala"));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx.Expected.TicketRequests().ToHaveCount(2).AssertAsync(ct);
    }

    private static async Task<HttpResponseMessage> HandleAsync(
        SeededContext ctx,
        string alias,
        int ticketRequestId
    )
    {
        var client = await ctx.Identity.ClientForAsync(
            alias,
            TestContext.Current.CancellationToken
        );
        return await client.DELETEAsync<DeleteTicketRequestById, DeleteTicketRequestByIdRequest>(
            new() { TicketRequestId = ticketRequestId }
        );
    }

    private Task<SeededContext> BuildClubAsync(CancellationToken ct) =>
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
                        club.AddVenue("buergerhaus", "Bürgerhaus")
                            .AddEvent("gala", "1. Prunksitzung", AtTheFirstGala, "buergerhaus")
                            .AddTicketRequest("mia-gala", "gala", "Mia Gast", "mia@guest.test")
                            .AddTicketRequest("ole-gala", "gala", "Ole Gast", "ole@guest.test")
                    ),
            ct
        );
}
