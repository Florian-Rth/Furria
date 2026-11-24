using System.Net;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Furria.Tests.Common.WebAuthn;
using Xunit;

namespace Furria.Api.Tests.Auth;

public sealed class DeleteMyPasskeyByIdTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteMyPasskeyByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePasskeyIsSomeoneElses()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAndBertaAsync(ct);
        var anna = await ctx.Identity.ClientForAsync("anna", ct);
        var berta = await ctx.Identity.ClientForAsync("berta", ct);
        using var bertasAuthenticator = new SoftwareAuthenticator();
        await PasskeySteps.RegisterAsync(berta, bertasAuthenticator);

        var response = await PasskeySteps.RemoveAsync(anna, bertasAuthenticator.PasskeyId);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx
            .Expected.PasskeysOfAccount(ctx.Identity.Accounts.IdOf("berta"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    private Task<SeededContext> ArrangeAnnaAndBertaAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("anna", "Anna", "Muster")
                        .AddAccount("anna")
                        .AddPerson("berta", "Berta", "Beispiel")
                        .AddAccount("berta")
                ),
            ct
        );
}
