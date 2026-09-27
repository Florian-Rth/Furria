using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Api.Endpoints.Persons;
using Furria.Tests.Common.Builder;
using Xunit;

namespace Furria.Api.Tests.Auth;

internal static class ClaimSteps
{
    public const string WrongClaimPassword = "Falsches-Passwort-9!";

    public static IdentitySeedBuilder AddStrayWithAccount(
        this IdentitySeedBuilder identity,
        string alias,
        string firstName
    ) => identity.AddPerson(alias, firstName, "Muster").AddAccount(alias);

    public static Task<TestResult<RedeemInvitationResponse>> ClaimAsync(
        HttpClient client,
        string token,
        string loginEmail,
        string claimPassword,
        string? password = null
    ) =>
        client.POSTAsync<RedeemInvitation, RedeemInvitationRequest, RedeemInvitationResponse>(
            new RedeemInvitationRequest
            {
                Token = token,
                Password = password,
                LoginEmail = loginEmail,
                ClaimPassword = claimPassword,
            }
        );

    public static Task<TestResult<RedeemInvitationResponse>> ClaimByPasskeyAsync(
        HttpClient client,
        string token,
        string loginEmail,
        PasskeyAssertionAttempt attempt
    ) =>
        client.POSTAsync<RedeemInvitation, RedeemInvitationRequest, RedeemInvitationResponse>(
            new RedeemInvitationRequest
            {
                Token = token,
                LoginEmail = loginEmail,
                ClaimPasskey = new RedeemInvitationPasskeyDto
                {
                    ChallengeId = attempt.ChallengeId,
                    Credential = attempt.Credential,
                },
            }
        );

    public static async Task GiveContactEmailAsync(
        HttpClient manager,
        int personId,
        string firstName,
        string contactEmail,
        DateOnly birthDate
    )
    {
        var response = await manager.PUTAsync<PutPerson, PutPersonRequest>(
            new PutPersonRequest
            {
                PersonId = personId,
                FirstName = firstName,
                LastName = "Muster",
                Email = contactEmail,
                Phone = null,
                Street = null,
                Zip = null,
                City = null,
                BirthDate = birthDate,
                ContactVisibleToMembers = false,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }
}
