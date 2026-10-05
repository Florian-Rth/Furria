using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.MembershipApplications;
using Furria.Api.Tests.Auth;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.MembershipApplications;

internal static class MembershipApplicationSteps
{
    public const string ConfirmationSubject = "Bitte bestätige deinen Beitrittsantrag";
    public const string ConfirmationLinkPrefix =
        $"{ApiTestFixture.WebsiteBaseUrl}/join/confirm#token=";
    public const string ArrivalNoticeSubject = "Neuer Beitrittsantrag von Mia Schwarzwälder";
    public const string ApplicationLinkPrefix =
        $"{ApiTestFixture.ClubAppBaseUrl}/manage/applications/";

    public static PostMembershipApplicationRequest ApplicationOf(
        string email,
        DateOnly birthDate
    ) =>
        new()
        {
            FirstName = "Mia",
            LastName = "Schwarzwälder",
            BirthDate = birthDate,
            Street = "Rosenweg 12a",
            PostalCode = "50667",
            City = "Köln",
            Email = email,
            Phone = "0221 987654",
            ConsentAccepted = true,
            Altcha = "",
        };

    public static async Task<GetMembershipApplicationChallengeResponse> ChallengeAsync(
        HttpClient client
    )
    {
        var (response, challenge) = await client.GETAsync<
            GetMembershipApplicationChallenge,
            GetMembershipApplicationChallengeResponse
        >();
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        return challenge;
    }

    public static async Task<string> SolvedAltchaAsync(HttpClient client)
    {
        var challenge = await ChallengeAsync(client);
        return AltchaSolver.PayloadOf(challenge, AltchaSolver.Solve(challenge));
    }

    public static async Task<HttpResponseMessage> ApplyAsync(
        HttpClient client,
        PostMembershipApplicationRequest application
    ) => await SubmitAsync(client, application with { Altcha = await SolvedAltchaAsync(client) });

    public static Task<HttpResponseMessage> SubmitAsync(
        HttpClient client,
        PostMembershipApplicationRequest application
    ) => client.POSTAsync<PostMembershipApplication, PostMembershipApplicationRequest>(application);

    public static async Task<IReadOnlyList<string>> RefusedFieldsAsync(
        HttpResponseMessage response,
        CancellationToken ct
    )
    {
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        return payload?.Errors.Keys.Order(StringComparer.Ordinal).ToList()
            ?? throw new InvalidOperationException("The refusal carried no errors.");
    }

    public static async Task<string> ApplyAndReadTokenAsync(
        ApiTestFixture fixture,
        HttpClient client,
        CancellationToken ct
    )
    {
        var email = InvitationSteps.UniqueContactEmail("mia");
        var response = await ApplyAsync(client, ApplicationOf(email, fixture.Today.AddYears(-30)));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        return (await fixture.Mailbox.SingleMailToAsync(email, ct)).LinkToken();
    }

    public static Task<TestResult<ConfirmMembershipApplicationResponse>> ConfirmAsync(
        HttpClient client,
        string token
    ) =>
        client.POSTAsync<
            ConfirmMembershipApplication,
            ConfirmMembershipApplicationRequest,
            ConfirmMembershipApplicationResponse
        >(new ConfirmMembershipApplicationRequest { Token = token });
}
