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
    public async Task Should_OfferADiscoverablePasskeyForTheClubDomain_When_SheIsSignedIn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);

        var (response, result) = await PasskeySteps.CreationOptionsAsync(client);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotEmpty(result.ChallengeId);
        Assert.Equal(
            ApiTestFixture.ClubDomain,
            result.Options.GetProperty("rp").GetProperty("id").GetString()
        );
        Assert.Equal(
            ctx.Identity.EmailOf("anna"),
            result.Options.GetProperty("user").GetProperty("name").GetString()
        );
        Assert.Equal(
            "Anna Muster",
            result.Options.GetProperty("user").GetProperty("displayName").GetString()
        );
        Assert.Equal(
            "required",
            result
                .Options.GetProperty("authenticatorSelection")
                .GetProperty("residentKey")
                .GetString()
        );
        await ctx.Expected.PasskeyChallenges().ToHaveCount(1).AssertAsync(ct);
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
    public async Task Should_ClearExpiredChallenges_When_ANewOneIsIssued()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        await PasskeySteps.CreationOptionsAsync(client);

        await _fixture.AtLaterTimeAsync(
            PasskeySteps.PastTheChallengeLifetime,
            async () => await PasskeySteps.RequestOptionsAsync(_fixture)
        );

        await ctx.Expected.PasskeyChallenges().ToHaveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_HerAccountIsDisabled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        await _fixture.DisableAccountDirectlyAsync(ctx.Identity.Accounts.IdOf("anna"), ct);

        var (response, _) = await PasskeySteps.CreationOptionsAsync(client);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx.Expected.PasskeyChallenges().ToHaveCount(0).AssertAsync(ct);
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
