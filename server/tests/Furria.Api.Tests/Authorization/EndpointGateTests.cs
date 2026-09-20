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
        "/api/auth/me",
        "/api/auth/me/contact-visibility",
        "/api/auth/logout",
        "/api/my-groups",
        "/api/my-groups/{groupId}",
        "/api/groups/{groupId}/info",
        "/api/groups/{groupId}/memberships",
        "/api/groups/{groupId}/memberships/{groupMembershipId}/end",
        "/api/groups/{groupId}/admins",
        "/api/groups/{groupId}/admins/{groupAdminId}/end",
        "/api/person-search",
        "/api/announcements/{announcementId}",
        "/api/announcements/{announcementId}/withdraw",
        "/api/auth/me/last-seen-announcement",
    ];

    private static readonly string[] InHandlerGatedProbes =
    [
        "/api/tests/group-access-probe/{groupId}",
        "/api/tests/group-administration-probe/{groupId}",
        "/api/tests/person-search-probe",
    ];

    private static readonly string[] DoubleGatedProbes = ["/api/tests/both-gates-probe"];

    private readonly ApiTestFixture _fixture;

    public EndpointGateTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public void Should_CarryAGate_When_AnEndpointIsRegistered()
    {
        var ungated = Registered()
            .Where(endpoint => !IsHarnessPlumbing(endpoint) && !IsGated(endpoint))
            .Select(RouteOf)
            .ToArray();

        Assert.Empty(ungated);
    }

    [Fact]
    public void Should_CarryOneGateKindOnly_When_AnEndpointIsRegistered()
    {
        var doubleGated = Registered()
            .Where(endpoint => GateKindCount(endpoint) > 1)
            .Select(RouteOf)
            .Where(route => !DoubleGatedProbes.Contains(route, StringComparer.Ordinal))
            .ToArray();

        Assert.Empty(doubleGated);
    }

    [Fact]
    public void Should_NameOnlyRegisteredRoutes_When_TheGateAllowlistIsRead()
    {
        var registered = Registered().Select(RouteOf).ToHashSet(StringComparer.Ordinal);

        var promised = InHandlerGated
            .Concat(InHandlerGatedProbes)
            .Concat(DoubleGatedProbes)
            .Where(route => !registered.Contains(route))
            .ToArray();

        Assert.Empty(promised);
    }

    [Fact]
    public void Should_NameNoAnonymousRoute_When_TheGateAllowlistIsRead()
    {
        var anonymous = Registered()
            .Where(endpoint =>
                endpoint.Metadata.GetMetadata<IAllowAnonymous>() is not null
                && InHandlerGated.Contains(RouteOf(endpoint), StringComparer.Ordinal)
            )
            .Select(RouteOf)
            .ToArray();

        Assert.Empty(anonymous);
    }

    private IEnumerable<RouteEndpoint> Registered() =>
        _fixture
            .Services.GetRequiredService<EndpointDataSource>()
            .Endpoints.OfType<RouteEndpoint>();

    private static bool IsHarnessPlumbing(RouteEndpoint endpoint) =>
        RouteOf(endpoint).Equals(HarnessUrlCacheRoute, StringComparison.Ordinal);

    private static bool IsGated(RouteEndpoint endpoint) =>
        GateKindCount(endpoint) > 0
        || endpoint.Metadata.GetMetadata<IAllowAnonymous>() is not null
        || InHandlerGated.Contains(RouteOf(endpoint), StringComparer.Ordinal)
        || InHandlerGatedProbes.Contains(RouteOf(endpoint), StringComparer.Ordinal);

    private static int GateKindCount(RouteEndpoint endpoint) =>
        Carried<PermissionRequirement>(endpoint)
        + Carried<AnyPermissionRequirement>(endpoint)
        + Carried<AffiliationRequirement>(endpoint);

    private static int Carried<TRequirement>(RouteEndpoint endpoint)
        where TRequirement : class => endpoint.Metadata.GetMetadata<TRequirement>() is null ? 0 : 1;

    private static string RouteOf(RouteEndpoint endpoint) => endpoint.RoutePattern.RawText ?? "";
}
