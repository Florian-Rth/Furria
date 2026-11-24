using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Intakes;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Intakes.IntakeScene;

namespace Furria.Api.Tests.Intakes;

public sealed class PutIntakeTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutIntakeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_KeepTheMembership_When_TheStartingGroupAdminSwapsHerGroups()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
            {
                With(intakes =>
                    intakes.AddIntake(
                        "own",
                        GuardTrainer,
                        memberFrom: _fixture.Today,
                        groupAliases: [Guard]
                    )
                )(builder);
                builder.Groups(groups => groups.AddGroupAdmin("show-co-admin", Show, GuardTrainer));
            },
            ct
        );
        var client = await ctx.Identity.ClientForAsync(GuardTrainer, ct);

        var response = await client.PUTAsync<PutIntake, PutIntakeRequest>(
            new()
            {
                IntakeId = ctx.Intakes.Intakes.IdOf("own"),
                MemberFrom = _fixture.Today,
                GroupIds = [ctx.Groups.Groups.IdOf(Show)],
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Intake(ctx.Intakes.Intakes.IdOf("own"))
            .ToDecide(_fixture.Today, ctx.Groups.Groups.IdOf(Show))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_Refuse_When_TheStartingGroupAdminAddsAMembership()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("own", GuardTrainer, groupAliases: [Guard])),
            ct
        );
        var client = await ctx.Identity.ClientForAsync(GuardTrainer, ct);

        var response = await client.PUTAsync<PutIntake, PutIntakeRequest>(
            new()
            {
                IntakeId = ctx.Intakes.Intakes.IdOf("own"),
                MemberFrom = _fixture.Today,
                GroupIds = [ctx.Groups.Groups.IdOf(Guard)],
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheEdit_When_TheNewcomerHasAlreadyFilledItIn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes =>
                intakes.AddIntake(
                    "review",
                    Manager,
                    groupAliases: [Guard],
                    submittedName: ("Lena", "Neu")
                )
            ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync(Manager, ct);

        var response = await client.PUTAsync<PutIntake, PutIntakeRequest>(
            new()
            {
                IntakeId = ctx.Intakes.Intakes.IdOf("review"),
                MemberFrom = _fixture.Today,
                GroupIds = [ctx.Groups.Groups.IdOf(Guard)],
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
}
