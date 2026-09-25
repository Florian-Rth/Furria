using System.Net;
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

    public static Task<TestResult<LookUpInvitationResponse>> LookUpAsync(
        HttpClient client,
        string token
    ) =>
        client.POSTAsync<LookUpInvitation, LookUpInvitationRequest, LookUpInvitationResponse>(
            new LookUpInvitationRequest { Token = token }
        );

    public static Task<TestResult<RedeemInvitationResponse>> RedeemAsync(
        HttpClient client,
        string token,
        string password = ValidPassword
    ) =>
        client.POSTAsync<RedeemInvitation, RedeemInvitationRequest, RedeemInvitationResponse>(
            new RedeemInvitationRequest { Token = token, Password = password }
        );

    public static string UnknownToken() =>
        Convert
            .ToBase64String(
                Guid.NewGuid().ToByteArray().Concat(Guid.NewGuid().ToByteArray()).ToArray()
            )
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
}
