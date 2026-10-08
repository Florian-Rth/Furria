using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.TicketRequests;
using Furria.Api.Tests.MembershipApplications;
using Xunit;

namespace Furria.Api.Tests.TicketRequests;

internal static class TicketRequestSteps
{
    public const string GuestName = "Mia Schwarzwälder";
    public const string GuestPhone = "0221 987654";
    public const string GuestMessage = "Gern nah an der Bühne, wir feiern einen Geburtstag.";
    public const string ReceiptSubject = "Deine Kartenanfrage ist beim Verein";
    public const string ArrivalNoticeSubject = "Neue Kartenanfrage von Mia Schwarzwälder";

    public static PostTicketRequestRequest RequestOf(int eventId, string email) =>
        new()
        {
            EventId = eventId,
            TicketCount = 4,
            Name = GuestName,
            Phone = GuestPhone,
            Email = email,
            Message = GuestMessage,
            ConsentAccepted = true,
            Altcha = "",
        };

    public static async Task<GetTicketRequestChallengeResponse> ChallengeAsync(HttpClient client)
    {
        var (response, challenge) = await client.GETAsync<
            GetTicketRequestChallenge,
            GetTicketRequestChallengeResponse
        >();
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        return challenge;
    }

    public static async Task<HttpResponseMessage> RequestAsync(
        HttpClient client,
        PostTicketRequestRequest request
    ) =>
        await SubmitAsync(
            client,
            request with
            {
                Altcha = AltchaSolver.SolvedPayloadOf(await ChallengeAsync(client)),
            }
        );

    public static Task<HttpResponseMessage> SubmitAsync(
        HttpClient client,
        PostTicketRequestRequest request
    ) => client.POSTAsync<PostTicketRequest, PostTicketRequestRequest>(request);

    public static async Task<IDictionary<string, List<string>>> FailuresAsync(
        HttpResponseMessage response,
        CancellationToken ct
    )
    {
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        return payload?.Errors
            ?? throw new InvalidOperationException("The failure response carried no errors.");
    }
}
