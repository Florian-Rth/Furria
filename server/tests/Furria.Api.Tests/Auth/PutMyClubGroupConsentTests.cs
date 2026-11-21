using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

public sealed class PutMyClubGroupConsentTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutMyClubGroupConsentTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RecordHerConsentAndReportItOnMe_When_SheSaysYes()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddPerson("paula", "Paula", "Brendel").AddAccount("paula")
                ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("paula", ct);

        var response = await client.PUTAsync<PutMyClubGroupConsent, PutMyClubGroupConsentRequest>(
            new() { ClubGroupConsent = true }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var (_, me) = await client.GETAsync<GetMe, GetMeResponse>();
        Assert.True(me.Person?.ClubGroupConsent);
    }

    [Fact]
    public async Task Should_WithdrawHerConsent_When_SheSaysNo()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddPerson("paula", "Paula", "Brendel").AddAccount("paula")
                ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("paula", ct);
        await client.PUTAsync<PutMyClubGroupConsent, PutMyClubGroupConsentRequest>(
            new() { ClubGroupConsent = true }
        );

        await client.PUTAsync<PutMyClubGroupConsent, PutMyClubGroupConsentRequest>(
            new() { ClubGroupConsent = false }
        );

        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToHaveClubGroupConsent(false)
            .AssertAsync(ct);
    }
}
