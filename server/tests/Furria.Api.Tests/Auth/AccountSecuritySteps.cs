using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

internal static class AccountSecuritySteps
{
    public const string NewPassword = "Anderes-Passwort-2026?";
    public const string WrongPassword = "Falsches-Passwort-2026!";
    public const string NoticeSubject = "Dein Zugang zur Vereins-App wurde geändert";
    public const string ConfirmationSubject = "Dein Bestätigungscode";
    public const int LockoutThreshold = 5;

    public static HttpClient ClientWith(ApiTestFixture fixture, string accessToken)
    {
        var client = fixture.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            accessToken
        );
        return client;
    }

    public static Task<TestResult<PutMyLoginEmailResponse>> RequestLoginEmailChangeAsync(
        HttpClient client,
        string loginEmail,
        bool updateContactEmail = true
    ) =>
        client.PUTAsync<PutMyLoginEmail, PutMyLoginEmailRequest, PutMyLoginEmailResponse>(
            new PutMyLoginEmailRequest
            {
                LoginEmail = loginEmail,
                UpdateContactEmail = updateContactEmail,
            }
        );

    public static async Task<string> RequestLoginEmailCodeAsync(
        ApiTestFixture fixture,
        HttpClient client,
        string loginEmail,
        CancellationToken ct,
        bool updateContactEmail = true
    )
    {
        var (response, _) = await RequestLoginEmailChangeAsync(
            client,
            loginEmail,
            updateContactEmail
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var mail = await fixture.Mailbox.SingleMailToAsync(loginEmail, ct);
        return mail.ConfirmationCode();
    }

    public static async Task<HttpResponseMessage> ConfirmLoginEmailAsync(
        HttpClient client,
        string code
    ) =>
        (
            await client.POSTAsync<ConfirmMyLoginEmail, ConfirmMyLoginEmailRequest, EmptyResponse>(
                new ConfirmMyLoginEmailRequest { Code = code }
            )
        ).Response;

    public static Task<TestResult<PutMyPasswordResponse>> ChangePasswordAsync(
        HttpClient client,
        string currentPassword,
        string newPassword = NewPassword
    ) =>
        client.PUTAsync<PutMyPassword, PutMyPasswordRequest, PutMyPasswordResponse>(
            new PutMyPasswordRequest
            {
                CurrentPassword = currentPassword,
                NewPassword = newPassword,
            }
        );

    public static async Task<HttpResponseMessage> DeleteAccountAsync(
        HttpClient client,
        string password
    ) =>
        (
            await client.DELETEAsync<DeleteMyAccount, DeleteMyAccountRequest, EmptyResponse>(
                new DeleteMyAccountRequest { Password = password }
            )
        ).Response;

    public static async Task<HttpResponseMessage> RefreshAsync(
        ApiTestFixture fixture,
        string refreshToken
    ) =>
        (
            await fixture
                .CreateClient()
                .POSTAsync<Refresh, RefreshRequest, RefreshResponse>(
                    new RefreshRequest { RefreshToken = refreshToken }
                )
        ).Response;

    public static async Task<HttpStatusCode> LogInStatusAsync(
        ApiTestFixture fixture,
        string email,
        string password
    )
    {
        var (response, _) = await fixture
            .CreateClient()
            .POSTAsync<Login, LoginRequest, LoginResponse>(
                new LoginRequest { Email = email, Password = password }
            );

        return response.StatusCode;
    }

    public static async Task AssertRefusedOnAsync(
        HttpResponseMessage response,
        string field,
        CancellationToken ct
    )
    {
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        Assert.NotNull(payload);
        Assert.Contains(field, payload.Errors.Keys);
    }
}
