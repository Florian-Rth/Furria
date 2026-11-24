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
