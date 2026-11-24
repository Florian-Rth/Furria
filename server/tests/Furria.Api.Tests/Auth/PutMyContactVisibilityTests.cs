using System.Net;
using System.Text;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

public sealed class PutMyContactVisibilityTests : IClassFixture<ApiTestFixture>
{
    private const string ContactVisibilityRoute = "/api/auth/me/contact-visibility";

    private readonly ApiTestFixture _fixture;

    public PutMyContactVisibilityTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_LeaveEveryOtherPersonAlone_When_SheTurnsHerOwnSwitchOff()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("wilma", "Wilma", "Ahrens")
                        .AddPersonContact("wilma", contactVisibleToMembers: true)
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPersonContact("paula", contactVisibleToMembers: true)
                        .AddAccount("paula")
                        .AddPerson("bodo", "Bodo", "Löffler")
                        .AddPersonContact("bodo", contactVisibleToMembers: true)
                        .AddAccount("bodo")
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var response = await client.PUTAsync<PutMyContactVisibility, PutMyContactVisibilityRequest>(
            new() { ContactVisibleToMembers = false }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToHaveContactVisible(false)
            .Person(ctx.Identity.People.IdOf("wilma"))
            .ToHaveContactVisible(true)
            .Person(ctx.Identity.People.IdOf("bodo"))
            .ToHaveContactVisible(true)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ChangeNothing_When_TheBodyCarriesNoSwitchValue()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPersonContact("paula", contactVisibleToMembers: true)
                        .AddAccount("paula")
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var response = await client.PutAsync(
            ContactVisibilityRoute,
            new StringContent("{}", Encoding.UTF8, "application/json"),
            ct
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToHaveContactVisible(true)
            .AssertAsync(ct);
    }
}
