using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Intakes;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Intakes.IntakeScene;

namespace Furria.Api.Tests.Intakes;

public sealed class GetIntakesTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetIntakesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ShowOnlyHerOwnAndHerGroupsIntakes_When_AGroupAdminLists()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes =>
                intakes
                    .AddIntake("own", GuardTrainer, groupAliases: [Guard], label: "eigener")
                    .AddIntake("board", Manager, groupAliases: [Guard], label: "vom Vorstand")
                    .AddIntake("show", ShowTrainer, groupAliases: [Show], label: "Showtanz")
                    .AddIntake("member", Manager, memberFrom: _fixture.Today, label: "Mitglied")
            ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync(GuardTrainer, ct);

        var (_, listed) = await client.GETAsync<GetIntakes, GetIntakesResponse>();

        var manageable = listed.Intakes.ToDictionary(
            intake => intake.Label!,
            intake => intake.CanManage
        );
        Assert.Equal(["eigener", "vom Vorstand"], manageable.Keys.Order());
        Assert.True(manageable["eigener"]);
        Assert.False(manageable["vom Vorstand"]);
    }

    [Fact]
    public async Task Should_Refuse_When_SomeoneWhoNeitherManagesPersonsNorRunsAGroupLists()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(With(), ct);
        var client = await ctx.Identity.ClientForAsync(Member, ct);

        var (response, _) = await client.GETAsync<GetIntakes, GetIntakesResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
