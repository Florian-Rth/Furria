using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Api.RateLimiting;
using Furria.Tests.Common.Fixtures;
using Furria.Tests.Common.WebAuthn;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Furria.Api.Tests.Auth;

internal static class PasskeySteps
{
    public const string WebOrigin = ApiTestFixture.ClubAppBaseUrl;
    public const string AndroidOrigin =
        "android:apk-key-hash:FG3pg8VzBlDY7rmVLzT8ZBagg0LmHb6oigSWsj_PROU";
    public const string ForeignOrigin = "https://club.furria.example";
    public const string PasskeyAddedLead = "ein neuer Passkey hinzugefügt";
    public const string PasskeyRemovedLead = "ein Passkey entfernt";

    public static readonly TimeSpan PastTheChallengeLifetime = TimeSpan.FromMinutes(6);

    public static Task<TestResult<PostPasskeyCreationOptionsResponse>> CreationOptionsAsync(
        HttpClient client
    ) => client.POSTAsync<PostPasskeyCreationOptions, PostPasskeyCreationOptionsResponse>();

    public static Task<TestResult<PostMyPasskeyResponse>> AddAsync(
        HttpClient client,
        string challengeId,
        JsonElement credential,
        string? name = null
    ) =>
        client.POSTAsync<PostMyPasskey, PostMyPasskeyRequest, PostMyPasskeyResponse>(
            new PostMyPasskeyRequest
            {
                ChallengeId = challengeId,
                Credential = credential,
                Name = name,
            }
        );

    public static async Task<PostMyPasskeyResponse> RegisterAsync(
        HttpClient client,
        SoftwareAuthenticator authenticator,
        string? name = null
    )
    {
        var (optionsResponse, options) = await CreationOptionsAsync(client);
        Assert.Equal(HttpStatusCode.OK, optionsResponse.StatusCode);

        var (response, passkey) = await AddAsync(
            client,
            options.ChallengeId,
            authenticator.Create(options.Options, WebOrigin),
            name
        );
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        return passkey;
    }

    public static Task<TestResult<PostPasskeyRequestOptionsResponse>> RequestOptionsAsync(
        ApiTestFixture fixture
    ) =>
        fixture
            .CreateClient()
            .POSTAsync<PostPasskeyRequestOptions, PostPasskeyRequestOptionsResponse>();

    public static async Task<PasskeyAssertionAttempt> AssertAsync(
        ApiTestFixture fixture,
        SoftwareAuthenticator authenticator,
        string origin = WebOrigin
    )
    {
        var (response, options) = await RequestOptionsAsync(fixture);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        return new PasskeyAssertionAttempt(
            options.ChallengeId,
            authenticator.Assert(options.Options, origin)
        );
    }

    public static Task<TestResult<LoginWithPasskeyResponse>> LogInAsync(
        ApiTestFixture fixture,
        PasskeyAssertionAttempt attempt
    ) =>
        fixture
            .CreateClient()
            .POSTAsync<LoginWithPasskey, LoginWithPasskeyRequest, LoginWithPasskeyResponse>(
                new LoginWithPasskeyRequest
                {
                    ChallengeId = attempt.ChallengeId,
                    Credential = attempt.Credential,
                }
            );

    public static async Task<HttpResponseMessage> RemoveAsync(
        HttpClient client,
        string passkeyId
    ) =>
        (
            await client.DELETEAsync<
                DeleteMyPasskeyById,
                DeleteMyPasskeyByIdRequest,
                EmptyResponse
            >(new DeleteMyPasskeyByIdRequest { PasskeyId = passkeyId })
        ).Response;

    public static async Task<HttpResponseMessage> DeleteAccountAsync(
        HttpClient client,
        PasskeyAssertionAttempt attempt
    ) =>
        (
            await client.DELETEAsync<DeleteMyAccount, DeleteMyAccountRequest, EmptyResponse>(
                new DeleteMyAccountRequest
                {
                    Passkey = new DeleteMyAccountPasskeyDto
                    {
                        ChallengeId = attempt.ChallengeId,
                        Credential = attempt.Credential,
                    },
                }
            )
        ).Response;

    public static string? RateLimitPolicyOf(ApiTestFixture fixture, string route) =>
        fixture
            .Services.GetRequiredService<EndpointDataSource>()
            .Endpoints.OfType<RouteEndpoint>()
            .Single(endpoint => endpoint.RoutePattern.RawText == route)
            .Metadata.GetMetadata<EnableRateLimitingAttribute>()
            ?.PolicyName;

    public static string PerIpPolicy => SignedOutRateLimiting.PerIpPolicy;
}

internal sealed record PasskeyAssertionAttempt(string ChallengeId, JsonElement Credential);
