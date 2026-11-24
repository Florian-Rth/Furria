using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Operations;
using Furria.Api.Tests.Auth;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Operations;

public sealed class GetClaimWindowTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetClaimWindowTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private DateOnly AdultBirthDate => _fixture.Today.AddYears(-41).AddDays(-3);

    [Fact]
    public async Task Should_MarkTheClaimRedeemed_When_SheCreatedHerAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddClaimablePerson(
                        "anna",
                        "Anna",
                        "Huber",
                        AdultBirthDate,
                        _fixture.Today
                    )
                ),
            ct
        );
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        await ClaimWindowSteps.OpenUntilAsync(
            manager,
            _fixture.TimeProvider.GetUtcNow().AddHours(3)
        );
        var (_, claim) = await ClaimWindowSteps.ClaimAsync(
            _fixture.CreateClient(),
            "Anna",
            "Huber",
            AdultBirthDate
        );
        var loginEmail = InvitationSteps.UniqueContactEmail("anna");
        var confirmationCode = await InvitationSteps.RequestConfirmationCodeAsync(
            _fixture,
            claim.Token!,
            loginEmail,
            ct
        );
        await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            claim.Token!,
            loginEmail: loginEmail,
            confirmationCode: confirmationCode
        );

        var (response, result) = await manager.GETAsync<GetClaimWindow, GetClaimWindowResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(Assert.Single(result.Claims).HasAccount);
    }
}
