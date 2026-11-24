using System.Net;
using Furria.Api.Endpoints.Auth;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Furria.Tests.Common.WebAuthn;
using Xunit;

namespace Furria.Api.Tests.Auth;

public sealed class PostPasskeyCreationOptionsTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostPasskeyCreationOptionsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ExcludeHerPasskeys_When_SheAlreadyHasOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        using var authenticator = new SoftwareAuthenticator();
        await PasskeySteps.RegisterAsync(client, authenticator);

        var (_, result) = await PasskeySteps.CreationOptionsAsync(client);

        var excluded = Assert.Single(
            result.Options.GetProperty("excludeCredentials").EnumerateArray()
        );
        Assert.Equal(authenticator.PasskeyId, excluded.GetProperty("id").GetString());
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheManagingLoginAsks()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (response, _) = await PasskeySteps.CreationOptionsAsync(client);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx.Expected.PasskeyChallenges().ToHaveCount(0).AssertAsync(ct);
    }

    private Task<SeededContext> ArrangeAnnaAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddPerson("anna", "Anna", "Muster").AddAccount("anna")
                ),
            ct
        );
}
