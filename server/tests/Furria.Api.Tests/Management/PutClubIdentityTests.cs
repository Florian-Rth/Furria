using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Management;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Management;

public sealed class PutClubIdentityTests : IClassFixture<ApiTestFixture>
{
    private const string OfficialName = "Großfurraer Carnevals Club e.V.";

    private readonly ApiTestFixture _fixture;

    public PutClubIdentityTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_LeaveTheOtherSectionsAlone_When_TheIdentityIsRewritten()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.SetClubRecord(
                        name: "Alter Name",
                        email: "vorstand@furria.de",
                        ageOfConsent: 14
                    )
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.PUTAsync<PutClubIdentity, PutClubIdentityRequest>(
            new()
            {
                Name = OfficialName,
                ShortName = null,
                FoundedYear = 1971,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.ClubRecord()
            .ToHaveName(OfficialName)
            .ClubRecord()
            .ToHaveEmail("vorstand@furria.de")
            .ClubRecord()
            .ToHaveAgeOfConsent(14)
            .AssertAsync(ct);
    }
}
