using System.Net;
using System.Net.Http.Headers;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Api.Endpoints.Persons;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

internal static class InvitationSteps
{
    public const string ValidPassword = "Neues-Passwort-2026!";

    private const string TokenMark = "#token=";
    private const string WrongCodeCandidate = "000000";
    private const string AlternativeWrongCode = "111111";
    private const string CodeAlphabet = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
    private const int CodeLength = 8;
    private const int CodeGroupLength = 4;

    public static string UniqueContactEmail(string name) => $"{name}-{Guid.NewGuid():N}@web.test";

    public static IdentitySeedBuilder AddEligiblePerson(
        this IdentitySeedBuilder identity,
        string alias,
        string firstName,
        string contactEmail,
        DateOnly today
    ) =>
        identity
            .AddPerson(alias, firstName, "Muster")
            .AddPersonContact(alias, contactEmail, birthDate: today.AddYears(-30))
            .AddMembership($"{alias}-membership", alias, today.AddYears(-1));

    public static async Task<PostPersonInvitationResponse> InviteAsync(
        HttpClient manager,
        int personId
    )
    {
        var (response, result) = await manager.POSTAsync<
            PostPersonInvitation,
            PostPersonInvitationRequest,
            PostPersonInvitationResponse
        >(new PostPersonInvitationRequest { PersonId = personId });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result;
    }

    public static async Task<string> InviteAndReadTokenAsync(
        ApiTestFixture fixture,
        HttpClient manager,
        int personId,
        string contactEmail,
        CancellationToken ct
    )
    {
        await InviteAsync(manager, personId);
        var mail = await fixture.Mailbox.SingleMailToAsync(contactEmail, ct);
        return mail.LinkToken();
    }

    public static async Task<PostPersonInvitationInPersonResponse> InviteInPersonAsync(
        HttpClient manager,
        int personId
    )
    {
        var (response, result) = await manager.POSTAsync<
            PostPersonInvitationInPerson,
            PostPersonInvitationInPersonRequest,
            PostPersonInvitationInPersonResponse
        >(new PostPersonInvitationInPersonRequest { PersonId = personId });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result;
    }

    public static string TokenOf(string link) =>
        link[(link.IndexOf(TokenMark, StringComparison.Ordinal) + TokenMark.Length)..];

    public static Task<TestResult<LookUpInvitationResponse>> LookUpAsync(
        HttpClient client,
        string token
    ) =>
        client.POSTAsync<LookUpInvitation, LookUpInvitationRequest, LookUpInvitationResponse>(
            new LookUpInvitationRequest { Token = token }
        );

    public static Task<TestResult<LookUpInvitationResponse>> LookUpByCodeAsync(
        HttpClient client,
        string code
    ) =>
        client.POSTAsync<LookUpInvitation, LookUpInvitationRequest, LookUpInvitationResponse>(
            new LookUpInvitationRequest { Code = code }
        );

    public static Task<TestResult<RedeemInvitationResponse>> RedeemAsync(
        HttpClient client,
        string token,
        string password = ValidPassword,
        string? loginEmail = null,
        string? confirmationCode = null
    ) =>
        client.POSTAsync<RedeemInvitation, RedeemInvitationRequest, RedeemInvitationResponse>(
            new RedeemInvitationRequest
            {
                Token = token,
                Password = password,
                LoginEmail = loginEmail,
                ConfirmationCode = confirmationCode,
            }
        );

    public static Task<TestResult<RedeemInvitationResponse>> RedeemByCodeAsync(
        HttpClient client,
        string code,
        string password = ValidPassword,
        string? loginEmail = null,
        string? confirmationCode = null,
        bool updateContactEmail = true
    ) =>
        client.POSTAsync<RedeemInvitation, RedeemInvitationRequest, RedeemInvitationResponse>(
            new RedeemInvitationRequest
            {
                Code = code,
                Password = password,
                LoginEmail = loginEmail,
                ConfirmationCode = confirmationCode,
                UpdateContactEmail = updateContactEmail,
            }
        );

    public static async Task<string> RequestConfirmationCodeAsync(
        ApiTestFixture fixture,
        string token,
        string loginEmail,
        CancellationToken ct
    )
    {
        var (response, result) = await RedeemAsync(
            fixture.CreateClient(),
            token,
            loginEmail: loginEmail
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(RedeemInvitationOutcome.ConfirmationRequired, result.Outcome);
        var mail = await fixture.Mailbox.SingleMailToAsync(loginEmail, ct);
        return mail.ConfirmationCode();
    }

    public static HttpClient SignedInClient(
        ApiTestFixture fixture,
        RedeemInvitationResponse redemption
    )
    {
        Assert.Equal(RedeemInvitationOutcome.Redeemed, redemption.Outcome);
        Assert.NotNull(redemption.Session);

        var client = fixture.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            redemption.Session.AccessToken
        );
        return client;
    }

    public static string WrongConfirmationCode(string code) =>
        code == WrongCodeCandidate ? AlternativeWrongCode : WrongCodeCandidate;

    public static string UnknownCode()
    {
        var code = new string(Random.Shared.GetItems<char>(CodeAlphabet, CodeLength));
        return $"{code[..CodeGroupLength]}-{code[CodeGroupLength..]}";
    }

    public static string UnknownToken() =>
        Convert
            .ToBase64String(
                Guid.NewGuid().ToByteArray().Concat(Guid.NewGuid().ToByteArray()).ToArray()
            )
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');

    public static async Task<PostPersonAccessRecoveryResponse> IssueRecoveryAsync(
        HttpClient manager,
        int personId
    )
    {
        var (response, result) = await manager.POSTAsync<
            PostPersonAccessRecovery,
            PostPersonAccessRecoveryRequest,
            PostPersonAccessRecoveryResponse
        >(new PostPersonAccessRecoveryRequest { PersonId = personId });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result;
    }

    public static Task<HttpResponseMessage> SetAccountDisabledAsync(
        HttpClient manager,
        int personId,
        bool isDisabled
    ) =>
        manager.PUTAsync<PutPersonAccountDisabled, PutPersonAccountDisabledRequest>(
            new PutPersonAccountDisabledRequest { PersonId = personId, IsDisabled = isDisabled }
        );
}
