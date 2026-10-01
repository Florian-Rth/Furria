using System.Globalization;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Api.RateLimiting;
using Furria.Tests.Common.Fixtures;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Furria.Api.Tests.Auth;

internal static class SignInLimitSteps
{
    public const int FailuresAllowed = 2;
    public const string WrongPassword = "Wrong-Password-1!";

    public static WebApplicationFactory<Program> HostAllowingFewFailures(ApiTestFixture fixture) =>
        fixture.HostWithSettings(
            new Dictionary<string, string>
            {
                [
                    $"{SignInRateLimitOptions.SectionName}:{nameof(SignInRateLimitOptions.FailedLoginsPerIp)}"
                ] = FailuresAllowed.ToString(CultureInfo.InvariantCulture),
                [
                    $"{SignInRateLimitOptions.SectionName}:{nameof(SignInRateLimitOptions.RejectedRefreshesPerIp)}"
                ] = FailuresAllowed.ToString(CultureInfo.InvariantCulture),
            }
        );

    public static Task<TestResult<LoginResponse>> LogInAsync(
        HttpClient client,
        string email,
        string password
    ) =>
        client.POSTAsync<Login, LoginRequest, LoginResponse>(
            new LoginRequest { Email = email, Password = password }
        );

    public static async Task FailToLogInAsync(HttpClient client, string email)
    {
        for (var attempt = 0; attempt < FailuresAllowed; attempt++)
            await LogInAsync(client, email, WrongPassword);
    }

    public static Task<TestResult<LoginWithPasskeyResponse>> LogInWithPasskeyAsync(
        HttpClient client,
        PasskeyAssertionAttempt attempt
    ) =>
        client.POSTAsync<LoginWithPasskey, LoginWithPasskeyRequest, LoginWithPasskeyResponse>(
            new LoginWithPasskeyRequest
            {
                ChallengeId = attempt.ChallengeId,
                Credential = attempt.Credential,
            }
        );

    public static Task<TestResult<RefreshResponse>> RefreshAsync(
        HttpClient client,
        string refreshToken
    ) =>
        client.POSTAsync<Refresh, RefreshRequest, RefreshResponse>(
            new RefreshRequest { RefreshToken = refreshToken }
        );
}
