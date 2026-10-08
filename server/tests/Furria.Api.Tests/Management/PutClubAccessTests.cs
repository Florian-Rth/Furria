using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Management;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Management;

public sealed class PutClubAccessTests : IClassFixture<ApiTestFixture>
{
    private const string AgeOfConsentField = "ageOfConsent";

    private readonly ApiTestFixture _fixture;

    public PutClubAccessTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_LeaveTheOtherSectionsAlone_When_TheAgeIsRewritten()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.SetClubRecord(
                        name: "Großfurraer Carnevals Club e.V.",
                        email: "vorstand@furria.de"
                    )
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.PUTAsync<PutClubAccess, PutClubAccessRequest>(
            new() { AgeOfConsent = 18 }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.ClubRecord()
            .ToHaveAgeOfConsent(18)
            .ClubRecord()
            .ToHaveName("Großfurraer Carnevals Club e.V.")
            .ClubRecord()
            .ToHaveEmail("vorstand@furria.de")
            .AssertAsync(ct);
    }

    [Theory]
    [InlineData(12)]
    [InlineData(21)]
    public async Task Should_AcceptTheAge_When_ItSitsOnTheEdgeOfTheRange(int ageOfConsent)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.PUTAsync<PutClubAccess, PutClubAccessRequest>(
            new() { AgeOfConsent = ageOfConsent }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx.Expected.ClubRecord().ToHaveAgeOfConsent(ageOfConsent).AssertAsync(ct);
    }

    [Theory]
    [InlineData(11)]
    [InlineData(22)]
    public async Task Should_ReturnBadRequest_When_TheAgeLiesOutsideTheRange(int ageOfConsent)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.PUTAsync<PutClubAccess, PutClubAccessRequest>(
            new() { AgeOfConsent = ageOfConsent }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Das Mindestalter liegt zwischen 12 und 21 Jahren."],
            failures[AgeOfConsentField]
        );
        await ctx.Expected.ClubRecord().ToNotExist().AssertAsync(ct);
    }

    private static async Task<IDictionary<string, List<string>>> ReadFailuresAsync(
        HttpResponseMessage response,
        CancellationToken ct
    )
    {
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        return payload?.Errors
            ?? throw new InvalidOperationException("The failure response carried no errors.");
    }
}
