using System.Net;
using Furria.Api.Tests.Auth;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Operations;

public sealed class DeleteClaimWindowTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteClaimWindowTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CloseTheWindowNow_When_ItIsOpen()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        var now = _fixture.TimeProvider.GetUtcNow();
        await ClaimWindowSteps.OpenUntilAsync(manager, now.AddHours(3));
        var closedAt = now.AddMinutes(20);
        HttpResponseMessage? response = null;

        await _fixture.AtInstantAsync(
            closedAt,
            async () =>
                response = await ClaimWindowSteps.CloseAsync(
                    await ctx.Identity.ManagingLoginClientAsync(ct)
                )
        );

        Assert.Equal(HttpStatusCode.NoContent, response!.StatusCode);
        await ctx
            .Expected.ClaimWindows()
            .ToHaveCount(1)
            .ClaimWindows()
            .ToHaveLatestClosedAt(closedAt)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ChangeNothing_When_NoWindowIsOpen()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await ClaimWindowSteps.CloseAsync(manager);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx.Expected.ClaimWindows().ToHaveCount(0).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepThePassedEnd_When_TheWindowClosedByItself()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        var closesAt = _fixture.TimeProvider.GetUtcNow().AddHours(1);
        await ClaimWindowSteps.OpenUntilAsync(manager, closesAt);
        HttpResponseMessage? response = null;

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromHours(2),
            async () =>
                response = await ClaimWindowSteps.CloseAsync(
                    await ctx.Identity.ManagingLoginClientAsync(ct)
                )
        );

        Assert.Equal(HttpStatusCode.NoContent, response!.StatusCode);
        await ctx
            .Expected.ClaimWindows()
            .ToHaveLatestEndingAt(closesAt, openedByPersonId: null)
            .AssertAsync(ct);
    }
}
