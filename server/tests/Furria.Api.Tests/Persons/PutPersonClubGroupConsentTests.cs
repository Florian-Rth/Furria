using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

public sealed class PutPersonClubGroupConsentTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutPersonClubGroupConsentTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_LeaveTheDecisionToHer_When_SheHasAnAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddPerson("paula", "Paula", "Brendel").AddAccount("paula")
                ),
            ct
        );
        var personId = ctx.Identity.People.IdOf("paula");
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await manager.PUTAsync<
            PutPersonClubGroupConsent,
            PutPersonClubGroupConsentRequest
        >(new() { PersonId = personId, ClubGroupConsent = true });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx.Expected.Person(personId).ToHaveClubGroupConsent(false).AssertAsync(ct);
    }
}
