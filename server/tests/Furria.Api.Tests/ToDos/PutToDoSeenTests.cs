using System.Net;
using Furria.Application.Authorization;
using Furria.Application.Management;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.ToDos;

[Collection("Api")]
public sealed class PutToDoSeenTests
{
    private const string AVersionNeverShown = "0000000000000000";

    private static readonly DateOnly JoinedIn2015 = new(2015, 11, 11);

    private readonly ApiTestFixture _fixture;

    public PutToDoSeenTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_FoldTheToDoAsSeen_When_TheShownVersionIsCurrent()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAKeyToTakeBackAsync(ct);
        var keyWarden = await ctx.Identity.ClientForAsync("maik", ct);
        var shown = await ToDoSteps.ShownToDoOfAsync(keyWarden, ToDoKind.KeyToTakeBack);

        var response = await ToDoSteps.MarkSeenAsync(
            keyWarden,
            ToDoKind.KeyToTakeBack,
            shown.Version
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var seen = await ToDoSteps.ShownToDoOfAsync(keyWarden, ToDoKind.KeyToTakeBack);
        Assert.False(shown.IsSeen);
        Assert.True(seen.IsSeen);
        Assert.Equal(0, seen.NewCount);
        Assert.Equal(1, seen.Count);
    }

    [Fact]
    public async Task Should_RefuseTheMark_When_AKeyJoinedSinceTheToDoWasShown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAKeyToTakeBackAsync(ct);
        var keyWarden = await ctx.Identity.ClientForAsync("maik", ct);
        var shown = await ToDoSteps.ShownToDoOfAsync(keyWarden, ToDoKind.KeyToTakeBack);
        await ToDoSteps.HandOutKeyAsync(
            keyWarden,
            ctx.Club.Venues.IdOf("vereinsheim"),
            ctx.Identity.People.IdOf("hanna"),
            JoinedIn2015
        );

        var response = await ToDoSteps.MarkSeenAsync(
            keyWarden,
            ToDoKind.KeyToTakeBack,
            shown.Version
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var unseen = await ToDoSteps.ShownToDoOfAsync(keyWarden, ToDoKind.KeyToTakeBack);
        Assert.False(unseen.IsSeen);
    }

    [Fact]
    public async Task Should_RefuseTheMark_When_TheVersionWasNeverShown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAKeyToTakeBackAsync(ct);
        var keyWarden = await ctx.Identity.ClientForAsync("maik", ct);

        var response = await ToDoSteps.MarkSeenAsync(
            keyWarden,
            ToDoKind.KeyToTakeBack,
            AVersionNeverShown
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_ClearTheNewItems_When_TheToDoIsMarkedSeenAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAKeyToTakeBackAsync(ct);
        var keyWarden = await ctx.Identity.ClientForAsync("maik", ct);
        await ToDoSteps.MarkShownAsSeenAsync(keyWarden, ToDoKind.KeyToTakeBack);
        await ToDoSteps.HandOutKeyAsync(
            keyWarden,
            ctx.Club.Venues.IdOf("vereinsheim"),
            ctx.Identity.People.IdOf("hanna"),
            JoinedIn2015
        );
        var withNews = await ToDoSteps.ShownToDoOfAsync(keyWarden, ToDoKind.KeyToTakeBack);

        var response = await ToDoSteps.MarkSeenAsync(
            keyWarden,
            ToDoKind.KeyToTakeBack,
            withNews.Version
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var seen = await ToDoSteps.ShownToDoOfAsync(keyWarden, ToDoKind.KeyToTakeBack);
        Assert.Equal(1, withNews.NewCount);
        Assert.True(seen.IsSeen);
        Assert.Equal(0, seen.NewCount);
        Assert.Equal(2, seen.Count);
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_TheKindIsNotOneOfHerToDos()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAKeyToTakeBackAsync(ct);
        var keyWarden = await ctx.Identity.ClientForAsync("maik", ct);

        var response = await ToDoSteps.MarkSeenAsync(
            keyWarden,
            ToDoKind.ApplicationWaiting,
            AVersionNeverShown
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_NothingIsLeftToDo()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAKeyToTakeBackAsync(ct);
        var keyWarden = await ctx.Identity.ClientForAsync("maik", ct);
        var shown = await ToDoSteps.ShownToDoOfAsync(keyWarden, ToDoKind.KeyToTakeBack);
        await ToDoSteps.TakeBackKeyAsync(
            keyWarden,
            ctx.Club.KeyHoldings.IdOf("hanna-sporthalle"),
            _fixture.Today
        );

        var response = await ToDoSteps.MarkSeenAsync(
            keyWarden,
            ToDoKind.KeyToTakeBack,
            shown.Version
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_Forbid_When_TheViewerHoldsNoKeyThatMakesWork()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAKeyToTakeBackAsync(ct);
        var member = await ctx.Identity.ClientForAsync("lena", ct);

        var response = await ToDoSteps.MarkSeenAsync(
            member,
            ToDoKind.KeyToTakeBack,
            AVersionNeverShown
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    private Task<SeededContext> BuildAKeyToTakeBackAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("maik", "Maik", "Schlüsselwart")
                            .AddAccount("maik")
                            .AddPerson("lena", "Lena", "Garde")
                            .AddAccount("lena")
                            .AddMembership("lena-member", "lena", JoinedIn2015)
                            .AddPerson("hanna", "Hanna", "Ausgetreten")
                            .AddMembership(
                                "hanna-member",
                                "hanna",
                                JoinedIn2015,
                                _fixture.Today.AddDays(-1)
                            )
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "schluesselwart",
                            "maik-schluesselwart",
                            "Schlüsselwart",
                            "maik",
                            FurriaPermissions.KeyHoldingsManage
                        )
                    )
                    .Club(club =>
                        club.AddVenue("sporthalle", "Sporthalle Am Ring")
                            .AddVenue("vereinsheim", "Vereinsheim")
                            .AddKeyHolding("hanna-sporthalle", "sporthalle", "hanna", JoinedIn2015)
                    ),
            ct
        );
}
