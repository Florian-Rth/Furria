using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

public sealed class PutPersonArchivedTests : IClassFixture<ApiTestFixture>
{
    private const string LastDayField = "lastDay";
    private const string RequestField = "request";
    private const int UnknownPersonId = 999_999;

    private static readonly DateOnly Joined2012 = new(2012, 11, 11);
    private static readonly DateOnly Left2019 = new(2019, 3, 31);
    private static readonly DateOnly Archived2020 = new(2020, 1, 15);

    private readonly ApiTestFixture _fixture;

    public PutPersonArchivedTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<HttpResponseMessage> SetArchivedAsync(
        HttpClient client,
        int personId,
        bool isArchived,
        DateOnly? lastDay = null
    ) =>
        client.PUTAsync<PutPersonArchived, PutPersonArchivedRequest>(
            new PutPersonArchivedRequest
            {
                PersonId = personId,
                IsArchived = isArchived,
                LastDay = lastDay,
            }
        );

    [Fact]
    public async Task Should_ArchiveHerTodayInTheCallersName_When_NothingOfHersRuns()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddMembership("paula-first", "paula", Joined2012, Left2019)
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddAccount("ilka")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "personenpflege",
                            "ilka-personenpflege",
                            "Personenpflege",
                            "ilka",
                            FurriaPermissions.PersonsManage
                        )
                    ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("ilka", ct);

        var response = await SetArchivedAsync(client, ctx.Identity.People.IdOf("paula"), true);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToBeArchived(_fixture.Today, ctx.Identity.People.IdOf("ilka"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_EndEveryRunningTieOnTheLastDay_When_SheIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var lastDay = _fixture.Today.AddDays(-3);
        var endingLater = _fixture.Today.AddDays(20);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddMembership("paula-running", "paula", Joined2012)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup("jugendgarde", "Jugendgarde")
                            .AddGroupMembership("paula-tanzgarde", "tanzgarde", "paula", Joined2012)
                            .AddGroupAdmin(
                                "paula-jugendgarde",
                                "jugendgarde",
                                "paula",
                                "Trainerin",
                                Joined2012,
                                endingLater
                            )
                    )
                    .Roles(roles =>
                        roles
                            .AddRole("kassenpruefung", "Kassenprüfung")
                            .AddRoleHolding(
                                "paula-kassenpruefung",
                                "kassenpruefung",
                                "paula",
                                Joined2012
                            )
                    )
                    .Club(club =>
                        club.AddBoardOffice("kassenwart", "Kassenwart", 3)
                            .AddBoardSeat("paula-kassenwart", "kassenwart", "paula", Joined2012)
                            .AddVenue("lager", "Lager", 2)
                            .AddKeyHolding("paula-lager", "lager", "paula", Joined2012)
                    ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await SetArchivedAsync(
            client,
            ctx.Identity.People.IdOf("paula"),
            true,
            lastDay
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToBeArchived(_fixture.Today, null)
            .Membership(ctx.Identity.Memberships.IdOf("paula-running"))
            .ToHavePeriod(Joined2012, lastDay)
            .GroupMembership(ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"))
            .ToHavePeriod(Joined2012, lastDay)
            .GroupAdmin(ctx.Groups.GroupAdmins.IdOf("paula-jugendgarde"))
            .ToHavePeriod(Joined2012, lastDay)
            .RoleHolding(ctx.Roles.RoleHoldings.IdOf("paula-kassenpruefung"))
            .ToHavePeriod(Joined2012, lastDay)
            .BoardSeat(ctx.Club.BoardSeats.IdOf("paula-kassenwart"))
            .ToHavePeriod(Joined2012, lastDay)
            .KeyHolding(ctx.Club.KeyHoldings.IdOf("paula-lager"))
            .ToHavePeriod(Joined2012, lastDay)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_EndHerTiesToo_When_TheyLieInAnArchivedGroupRoleAndOffice()
    {
        var ct = TestContext.Current.CancellationToken;
        var lastDay = _fixture.Today.AddDays(-1);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("paula", "Paula", "Brendel"))
                    .Groups(groups =>
                        groups
                            .AddGroup("altgarde", "Altgarde", archivedOn: Left2019)
                            .AddGroupMembership("paula-altgarde", "altgarde", "paula", Joined2012)
                            .AddGroupAdmin(
                                "paula-altgarde-admin",
                                "altgarde",
                                "paula",
                                sinceOn: Joined2012
                            )
                    )
                    .Roles(roles =>
                        roles
                            .AddRoleWithDetails("chronik", "Chronik", "", Left2019)
                            .AddRoleHolding("paula-chronik", "chronik", "paula", Joined2012)
                    )
                    .Club(club =>
                        club.AddBoardOffice("archivar", "Archivar", archivedOn: Left2019)
                            .AddBoardSeat("paula-archivar", "archivar", "paula", Joined2012)
                    ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await SetArchivedAsync(
            client,
            ctx.Identity.People.IdOf("paula"),
            true,
            lastDay
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToBeArchived(_fixture.Today, null)
            .GroupMembership(ctx.Groups.GroupMemberships.IdOf("paula-altgarde"))
            .ToHavePeriod(Joined2012, lastDay)
            .GroupAdmin(ctx.Groups.GroupAdmins.IdOf("paula-altgarde-admin"))
            .ToHavePeriod(Joined2012, lastDay)
            .RoleHolding(ctx.Roles.RoleHoldings.IdOf("paula-chronik"))
            .ToHavePeriod(Joined2012, lastDay)
            .BoardSeat(ctx.Club.BoardSeats.IdOf("paula-archivar"))
            .ToHavePeriod(Joined2012, lastDay)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_DeleteEverythingNotYetBegun_When_SheIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var nextMonth = _fixture.Today.AddMonths(1);
        var membershipEnd = _fixture.Today.AddDays(10);
        var aheadMembershipStart = _fixture.Today.AddDays(40);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddMembership("paula-ending", "paula", Joined2012, membershipEnd)
                            .AddMembership("paula-ahead", "paula", aheadMembershipStart)
                            .AddMembershipPause(
                                "paula-ahead-pause",
                                "paula-ahead",
                                _fixture.CurrentSessionYear + 1
                            )
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("paula-tanzgarde", "tanzgarde", "paula", nextMonth)
                            .AddGroupAdmin(
                                "paula-tanzgarde-admin",
                                "tanzgarde",
                                "paula",
                                sinceOn: nextMonth
                            )
                    )
                    .Roles(roles =>
                        roles
                            .AddRole("kassenpruefung", "Kassenprüfung")
                            .AddRoleHolding(
                                "paula-kassenpruefung",
                                "kassenpruefung",
                                "paula",
                                nextMonth
                            )
                    )
                    .Club(club =>
                        club.AddBoardOffice("kassenwart", "Kassenwart")
                            .AddBoardSeat("paula-kassenwart", "kassenwart", "paula", nextMonth)
                            .AddVenue("lager", "Lager")
                            .AddKeyHolding("paula-lager", "lager", "paula", _fixture.Today)
                    ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await SetArchivedAsync(
            client,
            ctx.Identity.People.IdOf("paula"),
            true,
            _fixture.Today.AddDays(-1)
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToBeArchived(_fixture.Today, null)
            .Membership(ctx.Identity.Memberships.IdOf("paula-ending"))
            .ToHavePeriod(Joined2012, _fixture.Today.AddDays(-1))
            .Membership(ctx.Identity.Memberships.IdOf("paula-ahead"))
            .ToNotExist()
            .MembershipPause(ctx.Identity.Pauses.IdOf("paula-ahead-pause"))
            .ToNotExist()
            .GroupMembership(ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"))
            .ToNotExist()
            .GroupAdmin(ctx.Groups.GroupAdmins.IdOf("paula-tanzgarde-admin"))
            .ToNotExist()
            .RoleHolding(ctx.Roles.RoleHoldings.IdOf("paula-kassenpruefung"))
            .ToNotExist()
            .BoardSeat(ctx.Club.BoardSeats.IdOf("paula-kassenwart"))
            .ToNotExist()
            .KeyHolding(ctx.Club.KeyHoldings.IdOf("paula-lager"))
            .ToNotExist()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ArchiveHerWithoutALastDay_When_EverythingOfHersLiesAhead()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("paula", "Paula", "Brendel"))
                    .Club(club =>
                        club.AddVenue("lager", "Lager")
                            .AddKeyHolding(
                                "paula-lager",
                                "lager",
                                "paula",
                                _fixture.Today.AddMonths(1)
                            )
                    ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await SetArchivedAsync(client, ctx.Identity.People.IdOf("paula"), true);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToBeArchived(_fixture.Today, null)
            .KeyHolding(ctx.Club.KeyHoldings.IdOf("paula-lager"))
            .ToNotExist()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_CutHerPausesAtTheLastDaysSession_When_SheIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var lastSession = _fixture.CurrentSessionYear - 1;
        var lastDay = new DateOnly(_fixture.CurrentSessionYear, 11, 10);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-running", "paula", Joined2012)
                        .AddMembershipPause("paula-open", "paula-running", lastSession - 1)
                        .AddMembershipPause("paula-later", "paula-running", lastSession + 2)
                        .AddMembershipPause("paula-ended", "paula-running", 2014, 2015)
                        .AddFeeReduction(
                            "paula-reduction",
                            "paula",
                            FeeReductionBasis.Studies,
                            lastSession,
                            lastSession + 1
                        )
                ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await SetArchivedAsync(
            client,
            ctx.Identity.People.IdOf("paula"),
            true,
            lastDay
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.MembershipPause(ctx.Identity.Pauses.IdOf("paula-open"))
            .ToHaveSpan(lastSession - 1, lastSession)
            .MembershipPause(ctx.Identity.Pauses.IdOf("paula-later"))
            .ToNotExist()
            .MembershipPause(ctx.Identity.Pauses.IdOf("paula-ended"))
            .ToHaveSpan(2014, 2015)
            .FeeReduction(ctx.Identity.FeeReductions.IdOf("paula-reduction"))
            .ToHaveSpan(lastSession, lastSession + 1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_CutAClosedPauseToo_When_ItReachesPastTheLastDaysSession()
    {
        var ct = TestContext.Current.CancellationToken;
        var lastSession = _fixture.CurrentSessionYear - 1;
        var lastDay = new DateOnly(_fixture.CurrentSessionYear, 11, 10);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-running", "paula", Joined2012)
                        .AddMembershipPause(
                            "paula-reaching",
                            "paula-running",
                            lastSession,
                            lastSession + 2
                        )
                ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await SetArchivedAsync(
            client,
            ctx.Identity.People.IdOf("paula"),
            true,
            lastDay
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.MembershipPause(ctx.Identity.Pauses.IdOf("paula-reaching"))
            .ToHaveSpan(lastSession, lastSession)
            .AssertAsync(ct);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    public async Task Should_RefuseTheLastDay_When_ItIsTodayOrLater(int daysFromToday)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-running", "paula", Joined2012)
                ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await SetArchivedAsync(
            client,
            ctx.Identity.People.IdOf("paula"),
            true,
            _fixture.Today.AddDays(daysFromToday)
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(
            ["Der letzte Tag ist spätestens gestern."],
            (await ReadFailuresAsync(response, ct))[LastDayField]
        );
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToNotBeArchived()
            .Membership(ctx.Identity.Memberships.IdOf("paula-running"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseNamingTheLatestStart_When_TheLastDayLiesBeforeIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var joinedLately = _fixture.Today.AddDays(-10);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddMembership("paula-running", "paula", Joined2012)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                joinedLately
                            )
                    ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await SetArchivedAsync(
            client,
            ctx.Identity.People.IdOf("paula"),
            true,
            joinedLately.AddDays(-1)
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        Assert.Equal(
            ["Der letzte Tag liegt vor dem Beginn von Gruppe Tanzgarde."],
            (await ReadFailuresAsync(response, ct))[RequestField]
        );
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToNotBeArchived()
            .Membership(ctx.Identity.Memberships.IdOf("paula-running"))
            .ToBeOpen()
            .GroupMembership(ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseToArchiveHer_When_SomethingRunsAndNoLastDayIsGiven()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-running", "paula", Joined2012)
                ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await SetArchivedAsync(client, ctx.Identity.People.IdOf("paula"), true);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        Assert.Equal(
            ["Der letzte Tag fehlt – es läuft noch etwas."],
            (await ReadFailuresAsync(response, ct))[RequestField]
        );
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToNotBeArchived()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_EndHerBoardSeatAndKey_When_TheArchiverMayOnlyManagePersons()
    {
        var ct = TestContext.Current.CancellationToken;
        var lastDay = _fixture.Today.AddDays(-1);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddAccount("ilka")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "personenpflege",
                            "ilka-personenpflege",
                            "Personenpflege",
                            "ilka",
                            FurriaPermissions.PersonsManage
                        )
                    )
                    .Club(club =>
                        club.AddBoardOffice("kassenwart", "Kassenwart")
                            .AddBoardSeat("paula-kassenwart", "kassenwart", "paula", Joined2012)
                            .AddVenue("lager", "Lager")
                            .AddKeyHolding("paula-lager", "lager", "paula", Joined2012)
                    ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("ilka", ct);

        var response = await SetArchivedAsync(
            client,
            ctx.Identity.People.IdOf("paula"),
            true,
            lastDay
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToBeArchived(_fixture.Today, ctx.Identity.People.IdOf("ilka"))
            .BoardSeat(ctx.Club.BoardSeats.IdOf("paula-kassenwart"))
            .ToHavePeriod(Joined2012, lastDay)
            .KeyHolding(ctx.Club.KeyHoldings.IdOf("paula-lager"))
            .ToHavePeriod(Joined2012, lastDay)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ArchiveHerOnce_When_TwoArchiversConfirmAtTheSameTime()
    {
        var ct = TestContext.Current.CancellationToken;
        var lastDay = _fixture.Today.AddDays(-1);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddMembership("paula-running", "paula", Joined2012)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                _fixture.Today.AddDays(5)
                            )
                    ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var paulaId = ctx.Identity.People.IdOf("paula");

        var responses = await _fixture.WhilePersonIsLockedAsync(
            paulaId,
            waitingSessions: 2,
            () =>
                Task.WhenAll(
                    SetArchivedAsync(client, paulaId, true, lastDay),
                    SetArchivedAsync(client, paulaId, true, lastDay)
                ),
            ct
        );

        Assert.Equal(
            [HttpStatusCode.NoContent, HttpStatusCode.NoContent],
            responses.Select(response => response.StatusCode)
        );
        await ctx
            .Expected.Person(paulaId)
            .ToBeArchived(_fixture.Today, null)
            .Membership(ctx.Identity.Memberships.IdOf("paula-running"))
            .ToHavePeriod(Joined2012, lastDay)
            .GroupMembership(ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"))
            .ToNotExist()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LeaveATieAlone_When_ItEndedBetweenTheLastDayAndToday()
    {
        var ct = TestContext.Current.CancellationToken;
        var lastDay = _fixture.Today.AddDays(-3);
        var returnedYesterday = _fixture.Today.AddDays(-1);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddMembership("paula-running", "paula", Joined2012)
                    )
                    .Club(club =>
                        club.AddVenue("lager", "Lager", 2)
                            .AddKeyHolding(
                                "paula-lager",
                                "lager",
                                "paula",
                                Joined2012,
                                returnedYesterday
                            )
                    ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await SetArchivedAsync(
            client,
            ctx.Identity.People.IdOf("paula"),
            true,
            lastDay
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.KeyHolding(ctx.Club.KeyHoldings.IdOf("paula-lager"))
            .ToHavePeriod(Joined2012, returnedYesterday)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_EndHerTiesOnTheLatestStart_When_TheLastDayIsThatVeryDay()
    {
        var ct = TestContext.Current.CancellationToken;
        var joinedLately = _fixture.Today.AddDays(-10);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddMembership("paula-running", "paula", Joined2012)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                joinedLately
                            )
                    ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await SetArchivedAsync(
            client,
            ctx.Identity.People.IdOf("paula"),
            true,
            joinedLately
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.GroupMembership(ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"))
            .ToHavePeriod(joinedLately, joinedLately)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RestoreHerWithoutReopeningAnything_When_SheIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPerson("anna", "Anna", "Vogt")
                        .AddMembership("paula-ended", "paula", Joined2012, Left2019)
                        .AddArchive("paula", Archived2020, "anna")
                ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await SetArchivedAsync(client, ctx.Identity.People.IdOf("paula"), false);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToNotBeArchived()
            .Membership(ctx.Identity.Memberships.IdOf("paula-ended"))
            .ToHavePeriod(Joined2012, Left2019)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepWhenAndByWhomSheWasArchived_When_SheIsArchivedAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPerson("anna", "Anna", "Vogt")
                        .AddArchive("paula", Archived2020, "anna")
                ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await SetArchivedAsync(client, ctx.Identity.People.IdOf("paula"), true);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToBeArchived(Archived2020, ctx.Identity.People.IdOf("anna"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LeaveHerAsSheIs_When_SheIsRestoredWithoutBeingArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-running", "paula", Joined2012)
                ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await SetArchivedAsync(client, ctx.Identity.People.IdOf("paula"), false);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("paula"))
            .ToNotBeArchived()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePersonIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await SetArchivedAsync(client, UnknownPersonId, true);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static async Task<IDictionary<string, List<string>>> ReadFailuresAsync(
        HttpResponseMessage response,
        CancellationToken ct
    )
    {
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        return payload?.Errors
            ?? throw new InvalidOperationException("The failure response carried no errors.");
    }
}
