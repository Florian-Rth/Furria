using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Management;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Management;

[Collection("Api")]
public sealed class DeleteSessionRecordByIdTests
{
    private const string Motto = "Vom Festzelt ins All";

    private readonly ApiTestFixture _fixture;

    public DeleteSessionRecordByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_LeaveTheSeasonNamedByItsDateAlone_When_TheEntryWasWrong()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddSession("vorige", 2025).AddSession("falsche", 2026, 53, Motto)
                ),
            ct
        );
        var wrongEntry = ctx.Club.Sessions.IdOf("falsche");

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await DiscardAsync(client, wrongEntry);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Session(wrongEntry)
            .ToNotExist()
            .Session(ctx.Club.Sessions.IdOf("vorige"))
            .ToHaveStartYear(2025)
            .AssertAsync(ct);
    }

    private static Task<HttpResponseMessage> DiscardAsync(HttpClient client, int sessionId) =>
        client.DELETEAsync<DeleteSessionRecordById, DeleteSessionRecordByIdRequest>(
            new DeleteSessionRecordByIdRequest { SessionId = sessionId }
        );
}
