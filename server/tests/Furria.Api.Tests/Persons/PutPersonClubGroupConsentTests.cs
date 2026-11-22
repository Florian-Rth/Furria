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
    public async Task Should_RecordConsentOnHerWord_When_SheHasNoAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddPerson("oma", "Hilde", "Ohne")),
            ct
        );
        var personId = ctx.Identity.People.IdOf("oma");
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await manager.PUTAsync<
            PutPersonClubGroupConsent,
            PutPersonClubGroupConsentRequest
        >(new() { PersonId = personId, ClubGroupConsent = true });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var (_, person) = await manager.GETAsync<
            GetPersonById,
            GetPersonByIdRequest,
            GetPersonByIdResponse
        >(new() { PersonId = personId });
        Assert.True(person.ClubGroupConsent);
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

    [Fact]
    public async Task Should_ReportNotFound_When_ThePersonIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await manager.PUTAsync<
            PutPersonClubGroupConsent,
            PutPersonClubGroupConsentRequest
        >(new() { PersonId = 999_999, ClubGroupConsent = true });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
