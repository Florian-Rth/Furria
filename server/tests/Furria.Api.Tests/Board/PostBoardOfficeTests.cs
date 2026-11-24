using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Board;
using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Board;

public sealed class PostBoardOfficeTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public PostBoardOfficeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<TestResult<PostBoardOfficeResponse>> CreateOfficeAsync(
        HttpClient client,
        string name,
        int sortOrder,
        ClubIcon? icon = null
    ) =>
        client.POSTAsync<PostBoardOffice, PostBoardOfficeRequest, PostBoardOfficeResponse>(
            new PostBoardOfficeRequest
            {
                Name = name,
                SortOrder = sortOrder,
                Icon = icon,
            }
        );

    [Fact]
    public async Task Should_ReturnConflict_When_TheNameBelongsToAnArchivedOffice()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddBoardOffice("pressewart", "Pressewart", 4, null, ArchivedIn2021)
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, _) = await CreateOfficeAsync(client, "Pressewart", 5);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.BoardOffice(ctx.Club.BoardOffices.IdOf("pressewart"))
            .ToBeArchivedOn(ArchivedIn2021)
            .AssertAsync(ct);
    }
}
