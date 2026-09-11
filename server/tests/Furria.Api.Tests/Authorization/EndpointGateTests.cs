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
    private const string HarnessUrlCacheRoute = "_test_url_cache_";

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

    private static readonly string[] InHandlerGatedProbes =
    [
        "/api/tests/group-access-probe/{groupId}",
        "/api/tests/group-administration-probe/{groupId}",
        "/api/tests/person-search-probe",
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
            .Where(endpoint => !IsHarnessPlumbing(endpoint) && !IsGated(endpoint))
            .Select(RouteOf)
            .ToArray();

        Assert.Empty(ungated);
    }

    private static bool IsHarnessPlumbing(RouteEndpoint endpoint) =>
        RouteOf(endpoint).Equals(HarnessUrlCacheRoute, StringComparison.Ordinal);

    private static bool IsGated(RouteEndpoint endpoint) =>
        endpoint.Metadata.GetMetadata<PermissionRequirement>() is not null
        || endpoint.Metadata.GetMetadata<AffiliationRequirement>() is not null
        || endpoint.Metadata.GetMetadata<IAllowAnonymous>() is not null
        || InHandlerGated.Contains(RouteOf(endpoint), StringComparer.Ordinal)
        || InHandlerGatedProbes.Contains(RouteOf(endpoint), StringComparer.Ordinal);

    private static string RouteOf(RouteEndpoint endpoint) => endpoint.RoutePattern.RawText ?? "";
}
