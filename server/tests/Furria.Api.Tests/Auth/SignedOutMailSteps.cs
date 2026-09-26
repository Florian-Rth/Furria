using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

internal static class SignedOutMailSteps
{
    public const string NewPassword = "Frisches-Passwort-2026!";
    public const string ResetLinkPrefix = $"{ApiTestFixture.ClubAppBaseUrl}/reset-password#reset=";

    private const string ResetMark = "#reset=";

    public static Task<HttpResponseMessage> RequestAccessAsync(HttpClient client, string email) =>
        client.POSTAsync<RequestAccess, RequestAccessRequest>(
            new RequestAccessRequest { Email = email }
        );

    public static Task<HttpResponseMessage> RequestPasswordResetAsync(
        HttpClient client,
        string email
    ) =>
        client.POSTAsync<RequestPasswordReset, RequestPasswordResetRequest>(
            new RequestPasswordResetRequest { Email = email }
        );

    public static Task<HttpResponseMessage> ResetPasswordAsync(
        HttpClient client,
        string reset,
        string password = NewPassword
    ) =>
        client.POSTAsync<ResetPassword, ResetPasswordRequest>(
            new ResetPasswordRequest { Reset = reset, Password = password }
        );

    public static async Task<string> RequestResetAndReadItAsync(
        ApiTestFixture fixture,
        string loginEmail,
        CancellationToken ct
    )
    {
        var response = await RequestPasswordResetAsync(fixture.CreateClient(), loginEmail);
        Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);

        var mail = await fixture.Mailbox.SingleMailToAsync(loginEmail, ct);
        return ResetOf(mail.Link());
    }

    public static async Task SettleAsync(
        ApiTestFixture fixture,
        string sentinelLoginEmail,
        CancellationToken ct
    )
    {
        var response = await RequestPasswordResetAsync(fixture.CreateClient(), sentinelLoginEmail);
        Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);

        await fixture.Mailbox.SingleMailToAsync(sentinelLoginEmail, ct);
    }

    public static async Task<IReadOnlyList<ReceivedMail>> MailsAlreadyInAsync(
        ApiTestFixture fixture,
        string recipient,
        CancellationToken ct
    ) => await fixture.Mailbox.MailsToAsync(recipient, 0, ct);

    public static async Task<AnswerFingerprint> FingerprintOfAsync(
        HttpResponseMessage response,
        CancellationToken ct
    ) =>
        new(
            response.StatusCode,
            response.Content.Headers.ToString(),
            Convert.ToBase64String(await response.Content.ReadAsByteArrayAsync(ct))
        );

    public static string ResetOf(string link) =>
        link[(link.IndexOf(ResetMark, StringComparison.Ordinal) + ResetMark.Length)..];

    public static string UnknownReset() =>
        Convert
            .ToBase64String([0, 0, 0, 1, .. Guid.NewGuid().ToByteArray()])
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');

    public sealed record AnswerFingerprint(HttpStatusCode Status, string Headers, string Body);
}
