using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Calendar;
using Furria.Application.Authorization;
using Furria.Core.Push;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Push.SubscribedDevices;

namespace Furria.Api.Tests.Calendar;

public sealed class GetCalendarNotifyReachTests : IClassFixture<ApiTestFixture>
{
    private const string NotifyReachPath = "/api/calendar/notify-reach";
    private const string AudienceField = "audience";
    private const string TrainingForTheClubMessage = "Ein Training ist nie für den ganzen Verein.";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    private readonly ApiTestFixture _fixture;

    public GetCalendarNotifyReachTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CountTheSubscribedRunningMembersButTheCaller_When_TheClubIsAddressed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await SubscribedAsync(ctx, ct, "ilka", "chris", "mara", "paula", "fred");

        var (response, result) = await ReachAsync(ctx, "ilka", "kind=plain&audience=club", ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(2, result.People);
    }

    [Fact]
    public async Task Should_CountOnlyTheAddressedGroupsSubscribedMembers_When_GroupsAreAddressed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await SubscribedAsync(ctx, ct, "chris", "mara", "paula", "fred");
        var tanzgarde = ctx.Groups.Groups.IdOf("tanzgarde");

        var (response, result) = await ReachAsync(
            ctx,
            "ilka",
            $"kind=training&audience=groups&audienceGroupIds={tanzgarde}",
            ct
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(2, result.People);
    }

    [Fact]
    public async Task Should_CountTheChosenPeopleButTheCaller_When_PeopleAreChosen()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await SubscribedAsync(ctx, ct, "ilka", "chris", "paula", "fred");
        var people = ctx.Identity.People;

        var (response, result) = await ReachAsync(
            ctx,
            "ilka",
            "kind=plain&audience=people"
                + $"&audiencePersonIds={people.IdOf("ilka")}"
                + $"&audiencePersonIds={people.IdOf("paula")}"
                + $"&audiencePersonIds={people.IdOf("fred")}",
            ct
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(2, result.People);
    }

    [Fact]
    public async Task Should_LeaveMembersOut_When_TheyMutedInvitationsOrHaveNoDevice()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        await SubscribedAsync(ctx, ct, "chris", "mara");
        await MutedAsync(ctx, "chris", PushTopic.Invitations, ct);

        var (response, result) = await ReachAsync(ctx, "ilka", "kind=plain&audience=club", ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(1, result.People);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_AGroupAdminAddressesAForeignGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var kindergarde = ctx.Groups.Groups.IdOf("kindergarde");

        var (response, _) = await ReachAsync(
            ctx,
            "fred",
            $"kind=training&audience=groups&audienceGroupIds={kindergarde}",
            ct
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_ATrainingIsForTheWholeClub()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var (response, _) = await ReachAsync(ctx, "ilka", "kind=training&audience=club", ct);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var failures = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        Assert.Equal([TrainingForTheClubMessage], failures!.Errors[AudienceField]);
    }

    private static async Task<(HttpResponseMessage, GetCalendarNotifyReachResponse)> ReachAsync(
        SeededContext ctx,
        string callerAlias,
        string query,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync(callerAlias, ct);
        var response = await client.GetAsync($"{NotifyReachPath}?{query}", ct);
        if (response.StatusCode != HttpStatusCode.OK)
            return (response, new() { People = -1 });

        var result = await response.Content.ReadFromJsonAsync<GetCalendarNotifyReachResponse>(ct);
        return (response, result!);
    }

    private static async Task SubscribedAsync(
        SeededContext ctx,
        CancellationToken ct,
        params string[] accountAliases
    )
    {
        var run = Guid.NewGuid().ToString("N");
        foreach (var alias in accountAliases)
            await SubscribedDeviceAsync(ctx, alias, $"{alias}-{run}", ct);
    }

    private Task<SeededContext> BuildClubAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("ilka", "Ilka", "Kalender")
                            .AddAccount("ilka")
                            .AddMembership("ilka-first", "ilka", JoinedIn2017)
                            .AddPerson("chris", "Chris", "Mitglied")
                            .AddAccount("chris")
                            .AddMembership("chris-first", "chris", JoinedIn2017)
                            .AddPerson("mara", "Mara", "Kindergarde")
                            .AddAccount("mara")
                            .AddMembership("mara-first", "mara", JoinedIn2017)
                            .AddPerson("nina", "Nina", "Ohnegerät")
                            .AddAccount("nina")
                            .AddMembership("nina-first", "nina", JoinedIn2017)
                            .AddPerson("paula", "Paula", "Pause")
                            .AddAccount("paula")
                            .AddMembership("paula-first", "paula", JoinedIn2017)
                            .AddMembershipPause(
                                "paula-pause",
                                "paula-first",
                                _fixture.CurrentSessionYear,
                                _fixture.CurrentSessionYear
                            )
                            .AddPerson("fred", "Fred", "Fremd")
                            .AddAccount("fred")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroupMembership("fred-tanzgarde", "tanzgarde", "fred", JoinedIn2017)
                            .AddGroupMembership(
                                "chris-tanzgarde",
                                "tanzgarde",
                                "chris",
                                JoinedIn2017
                            )
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017
                            )
                            .AddGroupMembership(
                                "mara-kindergarde",
                                "kindergarde",
                                "mara",
                                JoinedIn2017
                            )
                            .AddGroupAdmin("fred-leads-tanzgarde", "tanzgarde", "fred")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "terminpflege",
                            "ilka-terminpflege",
                            "Terminpflege",
                            "ilka",
                            FurriaPermissions.CalendarManageClub
                        )
                    ),
            ct
        );
}
