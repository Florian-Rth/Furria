using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Board;
using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Board;

public sealed class PutBoardOfficeTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutBoardOfficeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<HttpResponseMessage> RenameOfficeAsync(
        HttpClient client,
        int boardOfficeId,
        string name,
        int sortOrder,
        ClubIcon? icon = null
    ) =>
        client.PUTAsync<PutBoardOffice, PutBoardOfficeRequest>(
            new PutBoardOfficeRequest
            {
                BoardOfficeId = boardOfficeId,
                Name = name,
                SortOrder = sortOrder,
                Icon = icon,
            }
        );

    [Fact]
    public async Task Should_ReturnConflict_When_AnotherOfficeCarriesTheName()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithBandAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await RenameOfficeAsync(
            client,
            ctx.Club.BoardOffices.IdOf("kassenwart"),
            "Präsident",
            2
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("kassenwart"))
            .ToHaveName("Kassenwart")
            .AssertAsync(ct);
    }

    private Task<SeededContext> BuildWithBandAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddBoardOffice("praesident", "Präsident", 1)
                        .AddBoardOffice("kassenwart", "Kassenwart", 2)
                ),
            ct
        );
}
