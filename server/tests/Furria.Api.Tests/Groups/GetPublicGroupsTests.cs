using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

public sealed class GetPublicGroupsTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetPublicGroupsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_LeaveOutTheGroup_When_ItIsAManagementGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroup("tanzgarde", "Tanzgarde")
                        .AddGroup("vorstandsrunde", "Vorstandsrunde", isManagementGroup: true)
                ),
            ct
        );

        var (response, result) = await _fixture
            .CreateClient()
            .GETAsync<GetPublicGroups, GetPublicGroupsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var shown = Assert.Single(result.Groups);
        Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), shown.GroupId);
    }
}
