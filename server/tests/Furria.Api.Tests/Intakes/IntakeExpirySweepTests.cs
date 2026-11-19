using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Intakes.IntakeScene;

namespace Furria.Api.Tests.Intakes;

public sealed class IntakeExpirySweepTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public IntakeExpirySweepTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_DropTheLinkAndHerPortrait_When_TheIntakeHasExpired()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("fresh", Manager, _fixture.Today)),
            ct
        );
        var intakeId = ctx.Intakes.Intakes.IdOf("fresh");
        await IntakePortraits.UploadedAsync(
            _fixture.CreateClient(),
            ctx.Intakes.LinkTokens.IdOf("fresh"),
            ct
        );

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromDays(7) + TimeSpan.FromHours(1),
            () => _fixture.SweepIntakesAsync(ct)
        );

        Assert.Empty(await IntakePortraits.HeldByAsync(_fixture, intakeId, ct));
        await ctx.Expected.Intake(intakeId).ToHaveNoLinkLeft().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheLinkAndHerPortrait_When_TheIntakeIsStillOpen()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("fresh", Manager, _fixture.Today)),
            ct
        );
        var intakeId = ctx.Intakes.Intakes.IdOf("fresh");
        await IntakePortraits.UploadedAsync(
            _fixture.CreateClient(),
            ctx.Intakes.LinkTokens.IdOf("fresh"),
            ct
        );

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromDays(7) - TimeSpan.FromSeconds(1),
            () => _fixture.SweepIntakesAsync(ct)
        );

        Assert.Single(await IntakePortraits.HeldByAsync(_fixture, intakeId, ct));
        await ctx.Expected.Intake(intakeId).ToStayOpen().AssertAsync(ct);
    }
}
