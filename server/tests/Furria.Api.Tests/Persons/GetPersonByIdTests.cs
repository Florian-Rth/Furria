using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Api.Tests.Auth;
using Furria.Application.Authorization;
using Furria.Application.Registry;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

public sealed class GetPersonByIdTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly RejoinedIn2021 = new(2021, 1, 1);
    private static readonly DateOnly ArchivedIn2024 = new(2024, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetPersonByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<TestResult<GetPersonByIdResponse>> ReadPersonAsync(
        HttpClient client,
        int personId
    ) =>
        client.GETAsync<GetPersonById, GetPersonByIdRequest, GetPersonByIdResponse>(
            new GetPersonByIdRequest { PersonId = personId }
        );

    [Fact]
    public async Task Should_MarkThePeriodAsFuture_When_TheMembershipHasNotBegunYet()
    {
        var ct = TestContext.Current.CancellationToken;
        var startsNextMonth = _fixture.Today.AddMonths(1);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("nora", "Nora", "Neumitglied")
                        .AddMembership("nora-first", "nora", startsNextMonth)
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("nora"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var period = Assert.Single(result.Memberships);
        Assert.True(period.IsFuture);
        Assert.False(period.IsRunning);
        Assert.Equal(MembershipState.None, result.MembershipState);
        Assert.Null(result.MemberSince);
    }

    [Fact]
    public async Task Should_LeaveOutTheArchivedOnes_When_ThePersonBelongedToAnArchivedGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("paula", "Paula", "Brendel"))
                    .Groups(groups =>
                        groups
                            .AddGroup(
                                "showtanz",
                                "Showtanz",
                                "Aufgeloest.",
                                isRecruiting: false,
                                ArchivedIn2024
                            )
                            .AddGroupMembership("paula-showtanz", "showtanz", "paula", JoinedIn2017)
                    )
                    .Roles(roles =>
                        roles
                            .AddRoleWithDetails(
                                "schriftfuehrung",
                                "Schriftfuehrung",
                                "Aufgeloest.",
                                ArchivedIn2024
                            )
                            .AddRoleHolding(
                                "paula-schriftfuehrung",
                                "schriftfuehrung",
                                "paula",
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(result.Groups);
        Assert.Empty(result.Roles);
    }

    [Fact]
    public async Task Should_NameWhatStillRuns_When_SheRunsAGroupSitsOnTheBoardAndHoldsAKey()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("paula", "Paula", "Brendel"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                "Trainerin",
                                JoinedIn2017
                            )
                    )
                    .Club(club =>
                        club.AddBoardOffice("kassenwart", "Kassenwart")
                            .AddBoardSeat("paula-kassenwart", "kassenwart", "paula", RejoinedIn2021)
                            .AddVenue("lager", "Requisitenlager")
                            .AddKeyHolding("paula-lager", "lager", "paula", RejoinedIn2021)
                    ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tenure = Assert.Single(result.UnendedGroupAdminTenures);
        Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), tenure.GroupId);
        Assert.Equal("Tanzgarde", tenure.Name);
        Assert.Equal("Trainerin", tenure.Function);
        Assert.Equal(JoinedIn2017, tenure.SinceOn);
        Assert.Null(tenure.UntilOn);
        var seat = Assert.Single(result.UnendedBoardSeats);
        Assert.Equal(ctx.Club.BoardOffices.IdOf("kassenwart"), seat.BoardOfficeId);
        Assert.Equal("Kassenwart", seat.Name);
        Assert.Equal(RejoinedIn2021, seat.SinceOn);
        Assert.Null(seat.UntilOn);
        var key = Assert.Single(result.UnendedKeyHoldings);
        Assert.Equal(ctx.Club.Venues.IdOf("lager"), key.VenueId);
        Assert.Equal("Requisitenlager", key.Name);
        Assert.Equal(RejoinedIn2021, key.SinceOn);
        Assert.Null(key.UntilOn);
    }

    [Fact]
    public async Task Should_LeaveOutOnlyTheEndedOnes_When_SomeEndedYesterdayAndSomeEndToday()
    {
        var ct = TestContext.Current.CancellationToken;
        var today = _fixture.Today;
        var yesterday = today.AddDays(-1);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("paula", "Paula", "Brendel"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup("elferrat", "Elferrat")
                            .AddGroupAdmin(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                sinceOn: JoinedIn2017,
                                untilOn: yesterday
                            )
                            .AddGroupAdmin(
                                "paula-elferrat",
                                "elferrat",
                                "paula",
                                sinceOn: JoinedIn2017,
                                untilOn: today
                            )
                    )
                    .Club(club =>
                        club.AddBoardOffice("kassenwart", "Kassenwart")
                            .AddBoardOffice("praesidium", "Praesidium")
                            .AddBoardSeat(
                                "paula-kassenwart",
                                "kassenwart",
                                "paula",
                                JoinedIn2017,
                                yesterday
                            )
                            .AddBoardSeat(
                                "paula-praesidium",
                                "praesidium",
                                "paula",
                                JoinedIn2017,
                                today
                            )
                            .AddVenue("lager", "Requisitenlager")
                            .AddVenue("halle", "Sporthalle")
                            .AddKeyHolding("paula-lager", "lager", "paula", JoinedIn2017, yesterday)
                            .AddKeyHolding("paula-halle", "halle", "paula", JoinedIn2017, today)
                    ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tenure = Assert.Single(result.UnendedGroupAdminTenures);
        Assert.Equal(ctx.Groups.Groups.IdOf("elferrat"), tenure.GroupId);
        Assert.Equal(today, tenure.UntilOn);
        var seat = Assert.Single(result.UnendedBoardSeats);
        Assert.Equal(ctx.Club.BoardOffices.IdOf("praesidium"), seat.BoardOfficeId);
        Assert.Equal(today, seat.UntilOn);
        var key = Assert.Single(result.UnendedKeyHoldings);
        Assert.Equal(ctx.Club.Venues.IdOf("halle"), key.VenueId);
        Assert.Equal(today, key.UntilOn);
    }

    [Fact]
    public async Task Should_NameTheFutureOnesToo_When_TheyBeginOnlyTomorrow()
    {
        var ct = TestContext.Current.CancellationToken;
        var tomorrow = _fixture.Today.AddDays(1);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("paula", "Paula", "Brendel"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                sinceOn: tomorrow
                            )
                    )
                    .Club(club =>
                        club.AddBoardOffice("kassenwart", "Kassenwart")
                            .AddBoardSeat("paula-kassenwart", "kassenwart", "paula", tomorrow)
                            .AddVenue("lager", "Requisitenlager")
                            .AddKeyHolding("paula-lager", "lager", "paula", tomorrow)
                    ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(tomorrow, Assert.Single(result.UnendedGroupAdminTenures).SinceOn);
        Assert.Equal(tomorrow, Assert.Single(result.UnendedBoardSeats).SinceOn);
        Assert.Equal(tomorrow, Assert.Single(result.UnendedKeyHoldings).SinceOn);
    }

    [Fact]
    public async Task Should_LeaveOutTheTenureAndTheSeat_When_TheirGroupAndOfficeAreArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("paula", "Paula", "Brendel"))
                    .Groups(groups =>
                        groups
                            .AddGroup(
                                "showtanz",
                                "Showtanz",
                                "Aufgeloest.",
                                isRecruiting: false,
                                ArchivedIn2024
                            )
                            .AddGroupAdmin(
                                "paula-showtanz",
                                "showtanz",
                                "paula",
                                sinceOn: JoinedIn2017
                            )
                    )
                    .Club(club =>
                        club.AddBoardOffice("beisitz", "Beisitz", archivedOn: ArchivedIn2024)
                            .AddBoardSeat("paula-beisitz", "beisitz", "paula", JoinedIn2017)
                    ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(result.UnendedGroupAdminTenures);
        Assert.Empty(result.UnendedBoardSeats);
    }

    [Fact]
    public async Task Should_NameTheTiesUnderArchivedParents_When_HerGroupRoleAndOfficeAreArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("paula", "Paula", "Brendel"))
                    .Groups(groups =>
                        groups
                            .AddGroup(
                                "showtanz",
                                "Showtanz",
                                "Aufgeloest.",
                                isRecruiting: false,
                                ArchivedIn2024
                            )
                            .AddGroupMembership("paula-showtanz", "showtanz", "paula", JoinedIn2017)
                            .AddGroupMembership(
                                "paula-showtanz-old",
                                "showtanz",
                                "paula",
                                JoinedIn2017,
                                LeftIn2020
                            )
                            .AddGroupAdmin(
                                "paula-showtanz-admin",
                                "showtanz",
                                "paula",
                                sinceOn: RejoinedIn2021
                            )
                    )
                    .Roles(roles =>
                        roles
                            .AddRoleWithDetails(
                                "schriftfuehrung",
                                "Schriftfuehrung",
                                "Aufgeloest.",
                                ArchivedIn2024
                            )
                            .AddRoleHolding(
                                "paula-schriftfuehrung",
                                "schriftfuehrung",
                                "paula",
                                JoinedIn2017
                            )
                    )
                    .Club(club =>
                        club.AddBoardOffice("beisitz", "Beisitz", archivedOn: ArchivedIn2024)
                            .AddBoardSeat("paula-beisitz", "beisitz", "paula", RejoinedIn2021)
                    ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [
                (ArchivedParentTieKind.Group, "Showtanz", JoinedIn2017),
                (ArchivedParentTieKind.Role, "Schriftfuehrung", JoinedIn2017),
                (ArchivedParentTieKind.GroupAdmin, "Showtanz", RejoinedIn2021),
                (ArchivedParentTieKind.BoardSeat, "Beisitz", RejoinedIn2021),
            ],
            result.UnendedTiesUnderArchivedParents.Select(tie => (tie.Kind, tie.Name, tie.SinceOn))
        );
    }

    [Fact]
    public async Task Should_StillNameTheKey_When_ItsVenueIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("paula", "Paula", "Brendel"))
                    .Club(club =>
                        club.AddVenue("altes-lager", "Altes Lager", archivedOn: ArchivedIn2024)
                            .AddKeyHolding(
                                "paula-altes-lager",
                                "altes-lager",
                                "paula",
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var key = Assert.Single(result.UnendedKeyHoldings);
        Assert.Equal(ctx.Club.Venues.IdOf("altes-lager"), key.VenueId);
    }

    [Fact]
    public async Task Should_ShowThePersonWithoutAccessRights_When_TheCallerOnlyHoldsPersonsDelete()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Muster")
                            .AddAccount("anna")
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddAccount("ilka")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "loeschung",
                            "ilka-loeschung",
                            "Löschung",
                            "ilka",
                            FurriaPermissions.PersonsDelete
                        )
                    ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("ilka", ct);

        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("anna"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Anna", result.FirstName);
        Assert.False(result.Access.Rights.CanInvite);
        Assert.False(result.Access.Rights.CanManageAccount);
    }

    [Fact]
    public async Task Should_ShowNoAccessWithTheReason_When_SheIsNotAffiliated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("anna", "Anna", "Muster")
                        .AddPersonContact("anna", birthDate: _fixture.Today.AddYears(-30))
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, _) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("anna"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync(ct));
        var access = document.RootElement.GetProperty("access");
        Assert.Equal("noAccess", access.GetProperty("state").GetString());
        Assert.Equal("notAffiliated", access.GetProperty("reason").GetString());
        Assert.Equal(JsonValueKind.Null, access.GetProperty("invitation").ValueKind);
        Assert.Empty(access.GetProperty("history").EnumerateArray());
    }

    [Fact]
    public async Task Should_ShowNoAccessWithTheExpiredInvitation_When_TheLinkRanOut()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        await InvitationSteps.InviteAsync(manager, annaId);

        GetPersonByIdResponse? later = null;
        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromDays(15),
            async () =>
            {
                var laterManager = await ctx.Identity.ManagingLoginClientAsync(ct);
                later = (await ReadPersonAsync(laterManager, annaId)).Result;
            }
        );

        Assert.NotNull(later);
        Assert.Equal(AccountAccessState.NoAccess, later.Access.State);
        Assert.Null(later.Access.Reason);
        Assert.True(later.Access.Invitation?.IsExpired);
    }

    [Fact]
    public async Task Should_LetTheViewerOnlyInvite_When_SheHoldsOnlyPersonsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Muster")
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
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("anna"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(result.Access.Rights.CanInvite);
        Assert.False(result.Access.Rights.CanManageAccount);
    }
}
