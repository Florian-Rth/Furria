using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Push;
using Furria.Application.Authorization;
using Furria.Core.Push;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.BeerList.BeerListCast;

namespace Furria.Api.Tests.Push;

public sealed class GetMyPushTopicsTests : IClassFixture<ApiTestFixture>
{
    private const string GroupOnly = "gina";
    private const string Trainer = "tina";
    private const string Reader = "rolf";
    private const string Outsider = "nora";
    private const string PersonlessLogin = "technik";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateTimeOffset LongAgo = new(2026, 1, 10, 12, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public GetMyPushTopicsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_OfferOnlyTheCalendarTopics_When_ThePersonOnlyBelongsToAGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);

        var topics = await TopicsOfAsync(ctx, GroupOnly, ct);

        Assert.Equal(
            [PushTopic.Invitations, PushTopic.Changes, PushTopic.Reminders],
            [.. topics.Select(setting => setting.Topic)]
        );
    }

    [Fact]
    public async Task Should_OfferAushangTopicsOnly_When_ThePersonReadsTheClubWithoutBelongingToIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);

        var topics = await TopicsOfAsync(ctx, Reader, ct);

        Assert.Equal(
            [PushTopic.Reminders, PushTopic.Announcements],
            [.. topics.Select(setting => setting.Topic)]
        );
    }

    [Theory]
    [InlineData(Outsider)]
    [InlineData(PersonlessLogin)]
    public async Task Should_OfferNothing_When_TheAccountCouldNeverBePushed(string alias)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildAsync(ct);

        Assert.Empty(await TopicsOfAsync(ctx, alias, ct));
    }

    private static async Task<IReadOnlyList<PushTopicSettingDto>> TopicsOfAsync(
        SeededContext ctx,
        string alias,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync(alias, ct);
        var (response, result) = await client.GETAsync<GetMyPushTopics, GetMyPushTopicsResponse>();
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        return result.Topics;
    }

    private Task<SeededContext> BuildAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                WardenAndDrinker(builder)
                    .Identity(identity =>
                        identity
                            .AddPerson(GroupOnly, "Gina", "Garde")
                            .AddAccount(GroupOnly)
                            .AddPerson(Reader, "Rolf", "Revisor")
                            .AddAccount(Reader)
                            .AddPerson(Outsider, "Nora", "Neu")
                            .AddAccount(Outsider)
                            .AddAccount(PersonlessLogin)
                            .AddPerson(Trainer, "Tina", "Trainerin")
                            .AddAccount(Trainer)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "gina-tanzgarde",
                                "tanzgarde",
                                GroupOnly,
                                JoinedIn2017
                            )
                            .AddGroupAdmin("tina-tanzgarde", "tanzgarde", Trainer)
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "kassenpruefer",
                            "rolf-kassenpruefer",
                            "Kassenprüfer",
                            Reader,
                            FurriaPermissions.ClubRead
                        )
                    )
                    .BeerList(beerList =>
                        beerList
                            .AddBeerPot(Pot, Warden, openedAt: LongAgo)
                            .AddBeerCrates(Pot, Drinker, 1, LongAgo.AddDays(1))
                    ),
            ct
        );
}
