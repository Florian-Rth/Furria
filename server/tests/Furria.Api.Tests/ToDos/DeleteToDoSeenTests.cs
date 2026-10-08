using System.Net;
using Furria.Application.Authorization;
using Furria.Application.Management;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.ToDos;

public sealed class DeleteToDoSeenTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly JoinedIn2015 = new(2015, 11, 11);

    private readonly ApiTestFixture _fixture;

    public DeleteToDoSeenTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnTheToDoToTheTop_When_ItsMarkIsRemoved()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAKeyToTakeBackAsync(ct);
        var keyWarden = await ctx.Identity.ClientForAsync("maik", ct);
        await ToDoSteps.MarkShownAsSeenAsync(keyWarden, ToDoKind.KeyToTakeBack);

        var response = await ToDoSteps.UnmarkSeenAsync(keyWarden, ToDoKind.KeyToTakeBack);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var unseen = await ToDoSteps.ShownToDoOfAsync(keyWarden, ToDoKind.KeyToTakeBack);
        Assert.False(unseen.IsSeen);
        Assert.Equal(0, unseen.NewCount);
    }

    [Fact]
    public async Task Should_AnswerNoContent_When_TheToDoCarriesNoMark()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAKeyToTakeBackAsync(ct);
        var keyWarden = await ctx.Identity.ClientForAsync("maik", ct);

        var response = await ToDoSteps.UnmarkSeenAsync(keyWarden, ToDoKind.KeyToTakeBack);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Should_LeaveOtherAccountsMarks_When_OneAccountRemovesItsMark()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAKeyToTakeBackAsync(ct);
        var keyWarden = await ctx.Identity.ClientForAsync("maik", ct);
        var deputy = await ctx.Identity.ClientForAsync("karl", ct);
        await ToDoSteps.MarkShownAsSeenAsync(keyWarden, ToDoKind.KeyToTakeBack);
        await ToDoSteps.MarkShownAsSeenAsync(deputy, ToDoKind.KeyToTakeBack);

        var response = await ToDoSteps.UnmarkSeenAsync(deputy, ToDoKind.KeyToTakeBack);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var wardens = await ToDoSteps.ShownToDoOfAsync(keyWarden, ToDoKind.KeyToTakeBack);
        var deputys = await ToDoSteps.ShownToDoOfAsync(deputy, ToDoKind.KeyToTakeBack);
        Assert.True(wardens.IsSeen);
        Assert.False(deputys.IsSeen);
    }

    private Task<SeededContext> BuildAKeyToTakeBackAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("maik", "Maik", "Schlüsselwart")
                            .AddAccount("maik")
                            .AddPerson("karl", "Karl", "Stellvertreter")
                            .AddAccount("karl")
                            .AddPerson("hanna", "Hanna", "Ausgetreten")
                            .AddMembership(
                                "hanna-member",
                                "hanna",
                                JoinedIn2015,
                                _fixture.Today.AddDays(-1)
                            )
                    )
                    .Roles(roles =>
                        roles
                            .AddRoleWithHolder(
                                "schluesselwart",
                                "maik-schluesselwart",
                                "Schlüsselwart",
                                "maik",
                                FurriaPermissions.KeyHoldingsManage
                            )
                            .AddRoleWithHolder(
                                "stellvertreter",
                                "karl-stellvertreter",
                                "Stellvertreter",
                                "karl",
                                FurriaPermissions.KeyHoldingsManage
                            )
                    )
                    .Club(club =>
                        club.AddVenue("sporthalle", "Sporthalle Am Ring")
                            .AddKeyHolding("hanna-sporthalle", "sporthalle", "hanna", JoinedIn2015)
                    ),
            ct
        );
}
