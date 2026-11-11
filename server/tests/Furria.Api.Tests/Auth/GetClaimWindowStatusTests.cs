using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

public sealed class GetClaimWindowStatusTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetClaimWindowStatusTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReportClosed_When_NoWindowWasEverOpened()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, result) = await _fixture
            .CreateClient()
            .GETAsync<GetClaimWindowStatus, GetClaimWindowStatusResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False(result.IsOpen);
        Assert.Null(result.ClosesAt);
    }

    [Fact]
    public async Task Should_ReportTheEndToAnyone_When_TheWindowIsOpen()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var closesAt = _fixture.TimeProvider.GetUtcNow().AddHours(3);
        await ClaimWindowSteps.OpenUntilAsync(
            await ctx.Identity.ManagingLoginClientAsync(ct),
            closesAt
        );

        var (response, result) = await _fixture
            .CreateClient()
            .GETAsync<GetClaimWindowStatus, GetClaimWindowStatusResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(result.IsOpen);
        Assert.Equal(closesAt, result.ClosesAt);
    }

    [Fact]
    public async Task Should_ReportClosed_When_TheEndHasPassed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        await ClaimWindowSteps.OpenUntilAsync(
            await ctx.Identity.ManagingLoginClientAsync(ct),
            _fixture.TimeProvider.GetUtcNow().AddHours(1)
        );
        GetClaimWindowStatusResponse? result = null;

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromHours(1),
            async () =>
                (_, result) = await _fixture
                    .CreateClient()
                    .GETAsync<GetClaimWindowStatus, GetClaimWindowStatusResponse>()
        );

        Assert.False(result!.IsOpen);
        Assert.Null(result.ClosesAt);
    }

    [Fact]
    public async Task Should_ReportClosed_When_TheWindowWasClosedByHand()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        await ClaimWindowSteps.OpenUntilAsync(
            manager,
            _fixture.TimeProvider.GetUtcNow().AddHours(1)
        );
        await ClaimWindowSteps.CloseAsync(manager);

        var (_, result) = await _fixture
            .CreateClient()
            .GETAsync<GetClaimWindowStatus, GetClaimWindowStatusResponse>();

        Assert.False(result.IsOpen);
        Assert.Null(result.ClosesAt);
    }
}
