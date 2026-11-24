using System.Net;
using FastEndpoints;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Authorization;

public sealed class AnyPermissionRequirementTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public AnyPermissionRequirementTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_Allow_When_TheCallerHoldsTheSecondOfTheListedKeys()
    {
        var response = await ProbeAsHolderOfAsync(FurriaPermissions.BoardManage);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Should_Refuse_When_TheCallerOnlyHoldsAKeyTheGateDoesNotList()
    {
        var response = await ProbeAsHolderOfAsync(FurriaPermissions.PersonsManage);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    private async Task<HttpResponseMessage> ProbeAsHolderOfAsync(params string[] permissionKeys)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("ilka"))
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "hausmeisterei",
                            "ilka-hausmeisterei",
                            "Hausmeisterei",
                            "ilka",
                            permissionKeys
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.GETAsync<AnyPermissionProbe, EmptyResponse>();

        return response;
    }
}
