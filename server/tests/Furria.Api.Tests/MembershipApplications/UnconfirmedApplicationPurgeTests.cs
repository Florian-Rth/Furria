using Furria.Infrastructure.MembershipApplications;
using Furria.Tests.Common.Fixtures;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Xunit;

namespace Furria.Api.Tests.MembershipApplications;

public sealed class UnconfirmedApplicationPurgeTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public UnconfirmedApplicationPurgeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_DeleteTheApplication_When_ItStaysUnconfirmedFor48Hours()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        await MembershipApplicationSteps.ApplyAndReadTokenAsync(
            _fixture,
            _fixture.CreateClient(),
            ct
        );

        await _fixture.AtLaterTimeAsync(TimeSpan.FromHours(48), () => SweepAsync(ct));

        await ctx.Expected.MembershipApplications().ToHaveCount(0).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheApplication_When_ItIsUnconfirmedForLessThan48Hours()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        await MembershipApplicationSteps.ApplyAndReadTokenAsync(
            _fixture,
            _fixture.CreateClient(),
            ct
        );

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromHours(48) - TimeSpan.FromSeconds(1),
            () => SweepAsync(ct)
        );

        await ctx.Expected.MembershipApplications().ToHaveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheApplication_When_ItWasConfirmed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = _fixture.CreateClient();
        var token = await MembershipApplicationSteps.ApplyAndReadTokenAsync(_fixture, client, ct);
        await MembershipApplicationSteps.ConfirmAsync(client, token);

        await _fixture.AtLaterTimeAsync(TimeSpan.FromDays(60), () => SweepAsync(ct));

        await ctx.Expected.MembershipApplications().ToHaveConfirmedCount(1).AssertAsync(ct);
    }

    private Task SweepAsync(CancellationToken ct) =>
        _fixture
            .Services.GetServices<IHostedService>()
            .OfType<UnconfirmedApplicationPurge>()
            .Single()
            .SweepAsync(ct);
}
