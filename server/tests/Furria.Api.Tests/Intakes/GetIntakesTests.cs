using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Intakes;
using Furria.Core.Intakes;
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
    public async Task Should_TellEveryStateApart_When_AManagerListsTheIntakes()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            With(intakes =>
                intakes
                    .AddIntake("open", Manager, groupAliases: [Guard], label: "offen")
                    .AddIntake(
                        "expired",
                        Manager,
                        groupAliases: [Guard],
                        label: "abgelaufen",
                        expiresAt: now.AddSeconds(-1)
                    )
                    .AddIntake(
                        "review",
                        Manager,
                        groupAliases: [Guard],
                        label: "zu prüfen",
                        submittedName: ("Lena", "Neu")
                    )
                    .AddIntake(
                        "done",
                        Manager,
                        groupAliases: [Guard],
                        label: "abgeschlossen",
                        completedAsPersonAlias: Member
                    )
                    .AddIntake(
                        "gone",
                        Manager,
                        groupAliases: [Guard],
                        label: "verworfen",
                        discardedAt: now.AddHours(-1)
                    )
            ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync(Manager, ct);

        var (response, listed) = await client.GETAsync<GetIntakes, GetIntakesResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var states = listed.Intakes.ToDictionary(intake => intake.Label!, intake => intake.State);
        Assert.Equal(IntakeState.Open, states["offen"]);
        Assert.Equal(IntakeState.Expired, states["abgelaufen"]);
        Assert.Equal(IntakeState.NeedsReview, states["zu prüfen"]);
        Assert.Equal(IntakeState.Completed, states["abgeschlossen"]);
        Assert.Equal(IntakeState.Discarded, states["verworfen"]);
    }

    [Fact]
    public async Task Should_NameTheNewcomer_When_SheFilledItInOrWasMadeAPerson()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes =>
                intakes
                    .AddIntake("open", Manager, groupAliases: [Guard], label: "offen")
                    .AddIntake(
                        "review",
                        Manager,
                        groupAliases: [Guard],
                        label: "zu prüfen",
                        submittedName: ("Lena", "Neu")
                    )
                    .AddIntake(
                        "done",
                        Manager,
                        groupAliases: [Guard],
                        label: "abgeschlossen",
                        completedAsPersonAlias: Member
                    )
            ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync(Manager, ct);

        var (_, listed) = await client.GETAsync<GetIntakes, GetIntakesResponse>();

        var newcomers = listed.Intakes.ToDictionary(
            intake => intake.Label!,
            intake => intake.Newcomer
        );
        Assert.Null(newcomers["offen"]);
        Assert.Equal("Lena", newcomers["zu prüfen"]?.FirstName);
        Assert.Null(newcomers["zu prüfen"]?.PersonId);
        Assert.Equal(ctx.Identity.People.IdOf(Member), newcomers["abgeschlossen"]?.PersonId);
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
