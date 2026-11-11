using System.Globalization;
using System.Net;
using Furria.Api.RateLimiting;
using Furria.Tests.Common.Fixtures;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Furria.Api.Tests.Auth;

internal static class OnboardingRateLimitSteps
{
    public const int PermitsPerIp = 2;
    public const int PermitsPerIpOnboarding = 4;

    private const string VenueAddress = "203.0.113.77";

    public static WebApplicationFactory<Program> VenueHost(ApiTestFixture fixture) =>
        fixture.HostWithSettings(
            new Dictionary<string, string>
            {
                [
                    $"{SignedOutRateLimitOptions.SectionName}:{nameof(SignedOutRateLimitOptions.PermitsPerIp)}"
                ] = PermitsPerIp.ToString(CultureInfo.InvariantCulture),
                [
                    $"{SignedOutRateLimitOptions.SectionName}:{nameof(SignedOutRateLimitOptions.PermitsPerIpOnboarding)}"
                ] = PermitsPerIpOnboarding.ToString(CultureInfo.InvariantCulture),
            }
        );

    public static HttpClient VenueClient(WebApplicationFactory<Program> host) =>
        host.CreateClientForwardedFor(VenueAddress);

    public static async Task AssertServesTheHallAsync(Func<Task<HttpStatusCode>> attempt)
    {
        var answered = new List<HttpStatusCode>();
        for (var count = 0; count < PermitsPerIpOnboarding; count++)
            answered.Add(await attempt());
        var beyond = await attempt();

        Assert.DoesNotContain(HttpStatusCode.TooManyRequests, answered);
        Assert.Equal(HttpStatusCode.TooManyRequests, beyond);
    }
}
