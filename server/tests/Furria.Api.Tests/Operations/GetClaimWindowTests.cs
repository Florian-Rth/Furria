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
    public async Task Should_ReportTheOpenWindowAndEveryClaimNewestFirst_When_PersonsClaimed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddClaimablePerson("anna", "Anna", "Huber", AdultBirthDate, _fixture.Today)
                        .AddClaimablePerson("ben", "Ben", "Gruber", AdultBirthDate, _fixture.Today)
                        .AddClaimablePerson("carl", "Carl", "Bauer", AdultBirthDate, _fixture.Today)
                ),
            ct
        );
        var openedAt = _fixture.TimeProvider.GetUtcNow();
        var closesAt = openedAt.AddHours(3);
        await ClaimWindowSteps.OpenUntilAsync(
            await ctx.Identity.ManagingLoginClientAsync(ct),
            closesAt
        );
        var annaFirstClaim = openedAt.AddMinutes(1);
        var benClaim = openedAt.AddMinutes(2);
        var annaSecondClaim = openedAt.AddMinutes(3);
        await ClaimAtAsync(annaFirstClaim, "Anna", "Huber");
        await ClaimAtAsync(benClaim, "Ben", "Gruber");
        await ClaimAtAsync(annaSecondClaim, "Anna", "Huber");
        GetClaimWindowResponse? result = null;
        HttpResponseMessage? response = null;

        await _fixture.AtInstantAsync(
            annaSecondClaim,
            async () =>
                (response, result) = await (
                    await ctx.Identity.ManagingLoginClientAsync(ct)
                ).GETAsync<GetClaimWindow, GetClaimWindowResponse>()
        );

        Assert.Equal(HttpStatusCode.OK, response!.StatusCode);
        Assert.NotNull(result!.Window);
        Assert.Equal(openedAt, result.Window.OpenedAt);
        Assert.Equal(closesAt, result.Window.ClosesAt);
        Assert.Equal(
            [
                (ctx.Identity.People.IdOf("anna"), "Anna", "Huber", annaSecondClaim, false),
                (ctx.Identity.People.IdOf("ben"), "Ben", "Gruber", benClaim, false),
            ],
            result.Claims.Select(claim =>
                (claim.PersonId, claim.FirstName, claim.LastName, claim.ClaimedAt, claim.HasAccount)
            )
        );
    }

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

    [Fact]
    public async Task Should_ReportNoWindowButKeepTheClaims_When_TheWindowHasClosed()
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
        await ClaimWindowSteps.ClaimAsync(_fixture.CreateClient(), "Anna", "Huber", AdultBirthDate);
        await ClaimWindowSteps.CloseAsync(manager);

        var (response, result) = await manager.GETAsync<GetClaimWindow, GetClaimWindowResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Null(result.Window);
        Assert.Equal(ctx.Identity.People.IdOf("anna"), Assert.Single(result.Claims).PersonId);
    }

    private Task ClaimAtAsync(DateTimeOffset instant, string firstName, string lastName) =>
        _fixture.AtInstantAsync(
            instant,
            async () =>
                await ClaimWindowSteps.ClaimAsync(
                    _fixture.CreateClient(),
                    firstName,
                    lastName,
                    AdultBirthDate
                )
        );
}
