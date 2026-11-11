using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Calendar;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Calendar;

public sealed class GetChoosablePeopleTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly ArchivedIn2026 = new(2026, 6, 30);

    private readonly ApiTestFixture _fixture;

    public GetChoosablePeopleTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListEveryChoosablePersonByName_When_ACalendarManagerAsks()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, result) = await client.GETAsync<
            GetChoosablePeople,
            GetChoosablePeopleResponse
        >();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            ["Bea Garde", "Chris Trainer", "Gabi Gast", "Ilka Kalender", "Nora Neu"],
            result.People.Select(person => $"{person.FirstName} {person.LastName}")
        );
    }

    [Fact]
    public async Task Should_NameOnlyTheRunningGroupsSheBelongsTo_When_ThePeopleAreListed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var tanzgarde = ctx.Groups.Groups.IdOf("tanzgarde");
        var kindergarde = ctx.Groups.Groups.IdOf("kindergarde");

        var client = await ctx.Identity.ClientForAsync("chris", ct);
        var (response, result) = await client.GETAsync<
            GetChoosablePeople,
            GetChoosablePeopleResponse
        >();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal([tanzgarde], GroupIdsOf(result, ctx.Identity.People.IdOf("bea")));
        Assert.Empty(GroupIdsOf(result, ctx.Identity.People.IdOf("chris")));
        Assert.Empty(GroupIdsOf(result, ctx.Identity.People.IdOf("gabi")));
        Assert.Equal(
            new[] { tanzgarde, kindergarde }.Order(),
            GroupIdsOf(result, ctx.Identity.People.IdOf("ilka"))
        );
        Assert.Equal([kindergarde], GroupIdsOf(result, ctx.Identity.People.IdOf("nora")));
    }

    [Fact]
    public async Task Should_LeaveOutAGuest_When_HerGroupTiesHaveEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, result) = await client.GETAsync<
            GetChoosablePeople,
            GetChoosablePeopleResponse
        >();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var listed = result.People.Select(person => person.PersonId).ToList();
        Assert.DoesNotContain(ctx.Identity.People.IdOf("olaf"), listed);
        Assert.DoesNotContain(ctx.Identity.People.IdOf("hanna"), listed);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerMayScheduleNothing()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var client = await ctx.Identity.ClientForAsync("bea", ct);
        var (response, _) = await client.GETAsync<GetChoosablePeople, GetChoosablePeopleResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    private Task<SeededContext> BuildClubAsync(CancellationToken ct)
    {
        var yesterday = _fixture.Today.AddDays(-1);

        return _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("ilka", "Ilka", "Kalender")
                            .AddAccount("ilka")
                            .AddMembership("ilka-first", "ilka", JoinedIn2017)
                            .AddPerson("chris", "Chris", "Trainer")
                            .AddAccount("chris")
                            .AddMembership("chris-first", "chris", JoinedIn2017)
                            .AddPerson("bea", "Bea", "Garde")
                            .AddAccount("bea")
                            .AddMembership("bea-first", "bea", JoinedIn2017)
                            .AddPerson("nora", "Nora", "Neu")
                            .AddPerson("gabi", "Gabi", "Gast")
                            .AddPerson("erik", "Erik", "Ehemalig")
                            .AddMembership("erik-first", "erik", JoinedIn2017, yesterday)
                            .AddPerson("alma", "Alma", "Altgarde")
                            .AddPerson("olaf", "Olaf", "Ausgetreten")
                            .AddPerson("hanna", "Hanna", "Ehemals")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "terminpflege",
                            "ilka-terminpflege",
                            "Terminpflege",
                            "ilka",
                            FurriaPermissions.CalendarManageClub
                        )
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroup("altgarde", "Altgarde", archivedOn: ArchivedIn2026)
                            .AddGroupMembership("ilka-tanzgarde", "tanzgarde", "ilka", JoinedIn2017)
                            .AddGroupMembership(
                                "ilka-kindergarde",
                                "kindergarde",
                                "ilka",
                                JoinedIn2017
                            )
                            .AddGroupMembership("bea-tanzgarde", "tanzgarde", "bea", JoinedIn2017)
                            .AddGroupMembership("bea-altgarde", "altgarde", "bea", JoinedIn2017)
                            .AddGroupMembership(
                                "bea-kindergarde",
                                "kindergarde",
                                "bea",
                                JoinedIn2017,
                                yesterday
                            )
                            .AddGroupMembership(
                                "nora-kindergarde",
                                "kindergarde",
                                "nora",
                                JoinedIn2017
                            )
                            .AddGroupMembership("alma-altgarde", "altgarde", "alma", JoinedIn2017)
                            .AddGroupAdmin(
                                "chris-tanzgarde",
                                "tanzgarde",
                                "chris",
                                "Trainer",
                                JoinedIn2017
                            )
                            .AddGroupMembership(
                                "olaf-tanzgarde",
                                "tanzgarde",
                                "olaf",
                                JoinedIn2017,
                                yesterday
                            )
                            .AddGroupAdmin(
                                "hanna-kindergarde",
                                "kindergarde",
                                "hanna",
                                "Betreuerin",
                                JoinedIn2017,
                                yesterday
                            )
                            .AddGroupAdmin(
                                "gabi-kindergarde",
                                "kindergarde",
                                "gabi",
                                "Betreuerin",
                                JoinedIn2017
                            )
                    ),
            ct
        );
    }

    private static IEnumerable<int> GroupIdsOf(GetChoosablePeopleResponse result, int personId) =>
        result.People.Single(person => person.PersonId == personId).GroupIds.Order();
}
