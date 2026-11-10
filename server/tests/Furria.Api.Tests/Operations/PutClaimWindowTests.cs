using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Operations;
using Furria.Api.Tests.Auth;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Operations;

public sealed class PutClaimWindowTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutClaimWindowTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_OpenTheWindowUntilTheEnd_When_NoneIsOpen()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        var closesAt = _fixture.TimeProvider.GetUtcNow().AddHours(3);

        var response = await manager.PUTAsync<PutClaimWindow, PutClaimWindowRequest>(
            new PutClaimWindowRequest { ClosesAt = closesAt }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.ClaimWindows()
            .ToHaveCount(1)
            .ClaimWindows()
            .ToHaveLatestEndingAt(closesAt, openedByPersonId: null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RecordWhoOpenedIt_When_APersonOpensTheWindow()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("vera"))
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "launch",
                            "vera-launch",
                            "Start",
                            "vera",
                            FurriaPermissions.ClaimWindowManage
                        )
                    ),
            ct
        );
        var vera = await ctx.Identity.ClientForAsync("vera", ct);
        var closesAt = _fixture.TimeProvider.GetUtcNow().AddHours(3);

        var response = await vera.PUTAsync<PutClaimWindow, PutClaimWindowRequest>(
            new PutClaimWindowRequest { ClosesAt = closesAt }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.ClaimWindows()
            .ToHaveLatestEndingAt(closesAt, ctx.Identity.People.IdOf("vera"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_MoveTheEnd_When_TheWindowIsAlreadyOpen()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        var now = _fixture.TimeProvider.GetUtcNow();
        await ClaimWindowSteps.OpenUntilAsync(manager, now.AddHours(3));

        var response = await manager.PUTAsync<PutClaimWindow, PutClaimWindowRequest>(
            new PutClaimWindowRequest { ClosesAt = now.AddHours(1) }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.ClaimWindows()
            .ToHaveCount(1)
            .ClaimWindows()
            .ToHaveLatestEndingAt(now.AddHours(1), openedByPersonId: null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_OpenANewWindow_When_TheLastOneWasClosed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        var now = _fixture.TimeProvider.GetUtcNow();
        await ClaimWindowSteps.OpenUntilAsync(manager, now.AddHours(3));
        await ClaimWindowSteps.CloseAsync(manager);

        var response = await manager.PUTAsync<PutClaimWindow, PutClaimWindowRequest>(
            new PutClaimWindowRequest { ClosesAt = now.AddHours(2) }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.ClaimWindows()
            .ToHaveCount(2)
            .ClaimWindows()
            .ToHaveLatestEndingAt(now.AddHours(2), openedByPersonId: null)
            .AssertAsync(ct);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(0)]
    [InlineData(7 * 24 * 60 + 1)]
    public async Task Should_RefuseTheEnd_When_ItIsNotAheadOrMoreThanAWeekAhead(int minutesAhead)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await manager.PUTAsync<PutClaimWindow, PutClaimWindowRequest>(
            new PutClaimWindowRequest
            {
                ClosesAt = _fixture.TimeProvider.GetUtcNow().AddMinutes(minutesAhead),
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx.Expected.ClaimWindows().ToHaveCount(0).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AcceptTheEnd_When_ItIsExactlyAWeekAhead()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        var closesAt = _fixture.TimeProvider.GetUtcNow().AddDays(7);

        var response = await manager.PUTAsync<PutClaimWindow, PutClaimWindowRequest>(
            new PutClaimWindowRequest { ClosesAt = closesAt }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.ClaimWindows()
            .ToHaveLatestEndingAt(closesAt, openedByPersonId: null)
            .AssertAsync(ct);
    }
}
