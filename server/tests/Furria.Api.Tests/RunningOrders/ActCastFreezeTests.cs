using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Core.RunningOrders;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;

namespace Furria.Api.Tests.RunningOrders;

[SeedsAliases]
public sealed class ActCastFreezeTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly AfterAshWednesday = new(2027, 2, 20);

    private readonly ApiTestFixture _fixture;

    public ActCastFreezeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_FreezeTheAshWednesdayCast_When_TheSessionHasClosed()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, actId) = await GardetanzOfTheRunningSessionAsync(ct);

        await _fixture.AtInstantAsync(
            AfterItsAshWednesday,
            async () =>
            {
                await _fixture.FreezeActCastsAsync(ct);

                var people = ctx.Identity.People;
                await ctx
                    .Expected.Act(actId)
                    .ToHaveFrozenCastExactly(people.IdOf(Anna), people.IdOf(Ben), people.IdOf(Dora))
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_ShowTheAshWednesdayCast_When_TheGroupChangedAfterTheSessionClosed()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, _) = await GardetanzOfTheRunningSessionAsync(ct);

        await _fixture.AtInstantAsync(
            AfterItsAshWednesday,
            async () =>
            {
                var client = await ctx.Identity.SignInAgainAsync(Planner, ct);

                var (_, result) = await client.GETAsync<GetActs, GetActsRequest, GetActsResponse>(
                    new() { Session = RunningSessionYear }
                );

                var act = Assert.Single(result.Acts);
                Assert.Equal(["Anna", "Ben", "Dora"], act.Cast.Select(person => person.FirstName));
            }
        );
    }

    private async Task<(SeededContext Context, int ActId)> GardetanzOfTheRunningSessionAsync(
        CancellationToken ct
    )
    {
        SeededContext? ctx = null;
        var actId = 0;
        await _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                ctx = await _fixture.BuildAsync(
                    PlannerWithGala(_fixture.Today)
                        + (
                            builder =>
                                builder.Groups(groups =>
                                    groups.AddGroupMembership(
                                        "clara-garde",
                                        Garde,
                                        Clara,
                                        AfterAshWednesday
                                    )
                                )
                        ),
                    ct
                );
                var client = await ctx.Identity.ClientForAsync(Planner, ct);
                actId = await CreateActAsync(
                    client,
                    "Gardetanz",
                    ctx.Groups.Groups.IdOf(Garde),
                    ActKind.Dance,
                    added: [ctx.Identity.People.IdOf(Ben)]
                );
            }
        );

        return (ctx ?? throw new InvalidOperationException("The seed did not run."), actId);
    }
}
