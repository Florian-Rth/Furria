using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Management;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Management;

public sealed class PutClubContactTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutClubContactTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_LeaveTheOtherSectionsAlone_When_TheContactIsRewritten()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.SetClubRecord(
                        name: "Großfurraer Carnevals Club e.V.",
                        foundedYear: 1971,
                        ageOfConsent: 14
                    )
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var response = await client.PUTAsync<PutClubContact, PutClubContactRequest>(FullContact());

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.ClubRecord()
            .ToHaveName("Großfurraer Carnevals Club e.V.")
            .ClubRecord()
            .ToHaveFoundedYear(1971)
            .ClubRecord()
            .ToHaveAgeOfConsent(14)
            .AssertAsync(ct);
    }

    private static PutClubContactRequest FullContact() =>
        new()
        {
            Street = "Hauptstraße 1",
            Zip = "99706",
            City = "Großfurra",
            Email = "vorstand@furria.de",
            Phone = "03632 123456",
            WebsiteUrl = "https://furria.de",
            InstagramUrl = "https://instagram.com/furria",
            FacebookUrl = "https://facebook.com/furria",
        };
}
