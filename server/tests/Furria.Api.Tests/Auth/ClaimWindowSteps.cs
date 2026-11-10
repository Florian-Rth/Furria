using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Api.Endpoints.Operations;
using Furria.Tests.Common.Builder;
using Xunit;

namespace Furria.Api.Tests.Auth;

internal static class ClaimWindowSteps
{
    public static readonly TimeSpan OpenFor = TimeSpan.FromHours(4);

    public static IdentitySeedBuilder AddClaimablePerson(
        this IdentitySeedBuilder identity,
        string alias,
        string firstName,
        string lastName,
        DateOnly birthDate,
        DateOnly today
    ) =>
        identity
            .AddPerson(alias, firstName, lastName)
            .AddPersonContact(alias, birthDate: birthDate, withoutEmail: true)
            .AddMembership($"{alias}-membership", alias, today.AddYears(-1));

    public static async Task OpenUntilAsync(HttpClient manager, DateTimeOffset closesAt)
    {
        var response = await manager.PUTAsync<PutClaimWindow, PutClaimWindowRequest>(
            new PutClaimWindowRequest { ClosesAt = closesAt }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    public static Task<HttpResponseMessage> CloseAsync(HttpClient manager) =>
        manager.DELETEAsync<DeleteClaimWindow, EmptyRequest>(EmptyRequest.Instance);

    public static Task<TestResult<PostClaimWindowClaimResponse>> ClaimAsync(
        HttpClient client,
        string firstName,
        string lastName,
        DateOnly birthDate
    ) =>
        client.POSTAsync<
            PostClaimWindowClaim,
            PostClaimWindowClaimRequest,
            PostClaimWindowClaimResponse
        >(
            new PostClaimWindowClaimRequest
            {
                FirstName = firstName,
                LastName = lastName,
                BirthDate = birthDate,
            }
        );
}
