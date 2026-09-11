using Furria.Api.Authorization;
using Furria.Tests.Common.Fixtures;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Furria.Api.Tests.Authorization;

[Collection("Api")]
public sealed class EndpointGateTests
{
    private const string RoutePrefix = "/api/";

    private static readonly string[] InHandlerGated =
    [
        "/api/auth/login",
        "/api/auth/refresh",
        "/api/auth/logout",
        "/api/auth/me",
        "/api/auth/me/contact-visibility",
        "/api/my-groups",
        "/api/my-groups/{groupId}",
        "/api/person-search",
        "/api/groups/{groupId}/info",
        "/api/groups/{groupId}/memberships",
        "/api/groups/{groupId}/memberships/{groupMembershipId}/end",
        "/api/groups/{groupId}/admins",
        "/api/groups/{groupId}/admins/{groupAdminId}/end",
    ];

    private readonly ApiTestFixture _fixture;

    public EndpointGateTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public void Should_CarryAGate_When_AnEndpointIsRegistered()
    {
        var source = _fixture.Services.GetRequiredService<EndpointDataSource>();
        var ungated = source
            .Endpoints.OfType<RouteEndpoint>()
            .Where(endpoint => IsApiRoute(endpoint) && !IsGated(endpoint))
            .Select(RouteOf)
            .ToArray();

        Assert.Empty(ungated);
    }

    private static bool IsApiRoute(RouteEndpoint endpoint) =>
        RouteOf(endpoint).StartsWith(RoutePrefix, StringComparison.Ordinal);

    private static bool IsGated(RouteEndpoint endpoint) =>
        endpoint.Metadata.GetMetadata<PermissionRequirement>() is not null
        || endpoint.Metadata.GetMetadata<AffiliationRequirement>() is not null
        || endpoint.Metadata.GetMetadata<IAllowAnonymous>() is not null
        || InHandlerGated.Contains(RouteOf(endpoint), StringComparer.Ordinal);

    private static string RouteOf(RouteEndpoint endpoint) => endpoint.RoutePattern.RawText ?? "";
}
