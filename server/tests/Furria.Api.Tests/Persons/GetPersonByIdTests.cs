using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Api.Tests.Auth;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

public sealed class GetPersonByIdTests : IClassFixture<ApiTestFixture>
{
    private const string PersonsRoute = "/api/manage/persons";

    private static readonly DateOnly BornIn1996 = new(1996, 4, 3);
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
    public async Task Should_CarryTheAddressAndTheBirthDate_When_APersonIsOpenedForEditing()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("alice", "Alice", "Muster")
                        .AddPersonContact(
                            "alice",
                            "alice@example.test",
                            "0170 1234567",
                            "Hauptstraße 12",
                            "99713",
                            "Großfurra",
                            contactVisibleToMembers: true,
                            BornIn1996
                        )
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("alice"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Alice", result.FirstName);
        Assert.Equal("Muster", result.LastName);
        Assert.Equal("alice@example.test", result.Email);
        Assert.Equal("0170 1234567", result.Phone);
        Assert.Equal("Hauptstraße 12", result.Street);
        Assert.Equal("99713", result.Zip);
        Assert.Equal("Großfurra", result.City);
        Assert.Equal(BornIn1996, result.BirthDate);
        Assert.True(result.ContactVisibleToMembers);
    }

    [Fact]
    public async Task Should_SayWhoArchivedHerAndWhen_When_SheIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPerson("anna", "Anna", "Kessler")
                        .AddArchive("paula", ArchivedIn2024, "anna")
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var archive = Assert.IsType<PersonArchiveDto>(result.Archive);
        Assert.Equal(ArchivedIn2024, archive.ArchivedOn);
        Assert.NotNull(archive.ArchivedBy);
        Assert.Equal(ctx.Identity.People.IdOf("anna"), archive.ArchivedBy.PersonId);
        Assert.Equal("Anna", archive.ArchivedBy.FirstName);
        Assert.Equal("Kessler", archive.ArchivedBy.LastName);
    }

    [Fact]
    public async Task Should_ShowTheArchiveNamingNobody_When_TheArchiverWasDeleted()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPerson("anna", "Anna", "Kessler")
                        .AddArchive("paula", ArchivedIn2024, "anna")
                ),
            ct
        );
        await _fixture.DeletePersonDirectlyAsync(ctx.Identity.People.IdOf("anna"), ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var archive = Assert.IsType<PersonArchiveDto>(result.Archive);
        Assert.Equal(ArchivedIn2024, archive.ArchivedOn);
        Assert.Null(archive.ArchivedBy);
    }

    [Fact]
    public async Task Should_ShowNoArchive_When_SheIsNotArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity => identity.AddPerson("paula", "Paula", "Brendel")),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Null(result.Archive);
    }

    [Fact]
    public async Task Should_ListThePeriodsNewestFirst_When_APersonRejoinedAfterLeaving()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("frank", "Frank", "Wiederkehr")
                        .AddMembership("frank-first", "frank", JoinedIn2017, LeftIn2020)
                        .AddMembership("frank-again", "frank", RejoinedIn2021)
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("frank"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [
                ctx.Identity.Memberships.IdOf("frank-again"),
                ctx.Identity.Memberships.IdOf("frank-first"),
            ],
            result.Memberships.Select(period => period.MembershipId).ToArray()
        );
        Assert.Equal(MembershipState.Active, result.MembershipState);
        Assert.Equal(JoinedIn2017, result.MemberSince);
    }

    [Fact]
    public async Task Should_NestTheMembershipPauseInsideItsPeriod_When_APersonPausedHerMembership()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("rita", "Rita", "Ruhend")
                        .AddMembership("rita-first", "rita", JoinedIn2017)
                        .AddMembershipPause("rita-pause", "rita-first", 2019, 2020)
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("rita"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var period = Assert.Single(result.Memberships);
        var pause = Assert.Single(period.Pauses);
        Assert.Equal(ctx.Identity.Pauses.IdOf("rita-pause"), pause.PauseId);
        Assert.Equal(2019, pause.FirstSessionYear);
        Assert.Equal(2020, pause.LastSessionYear);
    }

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
    public async Task Should_ListTheFeeReductionsNewestFirst_When_APersonCarriesSeveral()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("bea", "Bea", "Beitrag")
                        .AddFeeReduction("bea-school", "bea", FeeReductionBasis.School, 2016, 2019)
                        .AddFeeReduction(
                            "bea-studies",
                            "bea",
                            FeeReductionBasis.Studies,
                            2020,
                            2025
                        )
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("bea"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [
                ctx.Identity.FeeReductions.IdOf("bea-studies"),
                ctx.Identity.FeeReductions.IdOf("bea-school"),
            ],
            result.FeeReductions.Select(reduction => reduction.FeeReductionId).ToArray()
        );
        var studies = result.FeeReductions[0];
        Assert.Equal(FeeReductionBasis.Studies, studies.Basis);
        Assert.Equal(2020, studies.FirstSessionYear);
        Assert.Equal(2025, studies.LastSessionYear);
    }

    [Fact]
    public async Task Should_ListTheEndedTiesToo_When_ThePersonLeftAGroupAndARole()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("paula", "Paula", "Brendel"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017,
                                LeftIn2020
                            )
                    )
                    .Roles(roles =>
                        roles
                            .AddRole("kassenpruefung", "Kassenpruefung")
                            .AddRoleHolding(
                                "paula-kassenpruefung",
                                "kassenpruefung",
                                "paula",
                                JoinedIn2017,
                                LeftIn2020
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tanzgarde = Assert.Single(result.Groups);
        Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), tanzgarde.GroupId);
        Assert.Equal("Tanzgarde", tanzgarde.Name);
        Assert.Equal(JoinedIn2017, tanzgarde.JoinedOn);
        Assert.Equal(LeftIn2020, tanzgarde.LeftOn);
        var kassenpruefung = Assert.Single(result.Roles);
        Assert.Equal(ctx.Roles.Roles.IdOf("kassenpruefung"), kassenpruefung.RoleId);
        Assert.Equal("Kassenpruefung", kassenpruefung.Name);
        Assert.Equal(JoinedIn2017, kassenpruefung.SinceOn);
        Assert.Equal(LeftIn2020, kassenpruefung.UntilOn);
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
    public async Task Should_OrderWhatStillRunsTheWayTheClubDoes_When_SheHoldsSeveralOfEach()
    {
        var ct = TestContext.Current.CancellationToken;
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
                                sinceOn: JoinedIn2017
                            )
                            .AddGroupAdmin(
                                "paula-elferrat",
                                "elferrat",
                                "paula",
                                sinceOn: RejoinedIn2021
                            )
                    )
                    .Club(club =>
                        club.AddBoardOffice("kassenwart", "Kassenwart", sortOrder: 2)
                            .AddBoardOffice("praesidium", "Praesidium", sortOrder: 1)
                            .AddBoardSeat("paula-kassenwart", "kassenwart", "paula", JoinedIn2017)
                            .AddBoardSeat("paula-praesidium", "praesidium", "paula", RejoinedIn2021)
                            .AddVenue("halle", "Sporthalle", sortOrder: 2)
                            .AddVenue("lager", "Requisitenlager", sortOrder: 3)
                            .AddVenue("buero", "Vereinsbuero", sortOrder: 1)
                            .AddKeyHolding("paula-halle", "halle", "paula", JoinedIn2017)
                            .AddKeyHolding("paula-lager", "lager", "paula", JoinedIn2017)
                            .AddKeyHolding("paula-buero", "buero", "paula", RejoinedIn2021)
                    ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            ["Elferrat", "Tanzgarde"],
            result.UnendedGroupAdminTenures.Select(tenure => tenure.Name)
        );
        Assert.Equal(
            ["Praesidium", "Kassenwart"],
            result.UnendedBoardSeats.Select(seat => seat.Name)
        );
        Assert.Equal(
            ["Vereinsbuero", "Sporthalle", "Requisitenlager"],
            result.UnendedKeyHoldings.Select(key => key.Name)
        );
    }

    [Fact]
    public async Task Should_ShowThePersonWithHerAccess_When_TheCallerOnlyHoldsAccountsManage()
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
                            "zugangspflege",
                            "ilka-zugangspflege",
                            "Zugangspflege",
                            "ilka",
                            FurriaPermissions.AccountsManage
                        )
                    ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("ilka", ct);

        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("anna"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Anna", result.FirstName);
        Assert.Equal(AccountAccessState.Active, result.Access.State);
        Assert.False(result.Access.Rights.CanInvite);
        Assert.True(result.Access.Rights.CanManageAccount);
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
    public async Task Should_NameTheBasisAsAString_When_ThePayloadIsReadRaw()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("bea", "Bea", "Beitrag")
                        .AddMembership("bea-first", "bea", JoinedIn2017)
                        .AddFeeReduction(
                            "bea-minor",
                            "bea",
                            FeeReductionBasis.Apprenticeship,
                            2020,
                            2023
                        )
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var payload = await client.GetStringAsync(
            $"{PersonsRoute}/{ctx.Identity.People.IdOf("bea")}",
            ct
        );

        using var document = JsonDocument.Parse(payload);
        var fields = document.RootElement.EnumerateObject().Select(field => field.Name).ToArray();
        Assert.Equal(
            [
                "personId",
                "firstName",
                "lastName",
                "portrait",
                "email",
                "phone",
                "street",
                "zip",
                "city",
                "birthDate",
                "contactVisibleToMembers",
                "contactChange",
                "archive",
                "membershipState",
                "memberSince",
                "memberships",
                "feeReductions",
                "groups",
                "roles",
                "unendedGroupAdminTenures",
                "unendedBoardSeats",
                "unendedKeyHoldings",
                "access",
            ],
            fields
        );
        Assert.Equal("active", document.RootElement.GetProperty("membershipState").GetString());
        var reduction = document.RootElement.GetProperty("feeReductions").EnumerateArray().Single();
        Assert.Equal("apprenticeship", reduction.GetProperty("basis").GetString());
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
    public async Task Should_ShowTheLiveInvitationAndWhoSentIt_When_SheWasInvitedByMail()
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
        var issued = await InvitationSteps.InviteAsync(manager, annaId);

        var (response, result) = await ReadPersonAsync(manager, annaId);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(AccountAccessState.Invited, result.Access.State);
        Assert.Null(result.Access.Reason);
        var invitation = Assert.IsType<PersonAccessInvitationDto>(result.Access.Invitation);
        Assert.Equal(InvitationChannel.Mail, invitation.Channel);
        Assert.Equal(_fixture.TimeProvider.GetUtcNow(), invitation.IssuedAt);
        Assert.Equal(issued.ExpiresAt, invitation.ExpiresAt);
        Assert.False(invitation.IsExpired);
        Assert.Null(invitation.IssuedBy);
        var invited = Assert.Single(result.Access.History);
        Assert.Equal(AccountEventKind.Invited, invited.Kind);
        Assert.Null(invited.Actor);
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
    public async Task Should_ShowActiveWithTheWholeHistoryNewestFirst_When_SheRedeemedTheInvitation()
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
        var token = await InvitationSteps.InviteAndReadTokenAsync(
            _fixture,
            manager,
            annaId,
            annaEmail,
            ct
        );
        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromHours(2),
            () => InvitationSteps.RedeemAsync(_fixture.CreateClient(), token)
        );

        var (response, result) = await ReadPersonAsync(manager, annaId);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(AccountAccessState.Active, result.Access.State);
        Assert.Null(result.Access.Reason);
        Assert.Null(result.Access.Invitation);
        Assert.Equal(
            [AccountEventKind.Redeemed, AccountEventKind.Invited],
            result.Access.History.Select(entry => entry.Kind).ToArray()
        );
        Assert.Equal(
            [annaId, (int?)null],
            result.Access.History.Select(entry => entry.Actor?.PersonId).ToArray()
        );
    }

    [Fact]
    public async Task Should_ShowDisabled_When_HerAccountIsDisabled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddEligiblePerson(
                            "anna",
                            "Anna",
                            InvitationSteps.UniqueContactEmail("anna"),
                            _fixture.Today
                        )
                        .AddAccount("anna", disabled: true)
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("anna"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(AccountAccessState.Disabled, result.Access.State);
        Assert.Null(result.Access.Reason);
        Assert.Null(result.Access.Invitation);
    }

    [Fact]
    public async Task Should_ShowWhoAdmittedHerAndWhen_When_HerMembershipCameFromAnAdmission()
    {
        var ct = TestContext.Current.CancellationToken;
        var admittedAt = _fixture.TimeProvider.GetUtcNow().AddDays(-3);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("mia", "Mia", "Schwarzwälder")
                        .AddPerson("anna", "Anna", "Kessler")
                        .AddMembership("mia-admitted", "mia", _fixture.Today.AddDays(-3))
                        .AddAdmission(
                            "mia-admitted",
                            "anna",
                            admittedAt,
                            guardianConsentConfirmed: true
                        )
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("mia"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var admission = Assert.IsType<PersonMembershipAdmissionDto>(
            Assert.Single(result.Memberships).Admission
        );
        Assert.Equal(admittedAt, admission.AdmittedAt);
        var admitter = Assert.IsType<PersonMembershipAdmitterDto>(admission.AdmittedBy);
        Assert.Equal(ctx.Identity.People.IdOf("anna"), admitter.PersonId);
        Assert.Equal("Anna", admitter.FirstName);
        Assert.Equal("Kessler", admitter.LastName);
        Assert.True(admission.GuardianConsentConfirmed);
    }

    [Fact]
    public async Task Should_KeepTheAdmissionWithoutItsAuthor_When_TheAdmitterWasDeleted()
    {
        var ct = TestContext.Current.CancellationToken;
        var admittedAt = _fixture.TimeProvider.GetUtcNow().AddDays(-3);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("mia", "Mia", "Schwarzwälder")
                        .AddPerson("anna", "Anna", "Kessler")
                        .AddMembership("mia-admitted", "mia", _fixture.Today.AddDays(-3))
                        .AddAdmission("mia-admitted", "anna", admittedAt)
                ),
            ct
        );
        await _fixture.DeletePersonDirectlyAsync(ctx.Identity.People.IdOf("anna"), ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (_, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("mia"));

        var admission = Assert.IsType<PersonMembershipAdmissionDto>(
            Assert.Single(result.Memberships).Admission
        );
        Assert.Equal(admittedAt, admission.AdmittedAt);
        Assert.Null(admission.AdmittedBy);
        Assert.False(admission.GuardianConsentConfirmed);
    }

    [Fact]
    public async Task Should_ShowNoAdmission_When_TheMembershipWasEnteredByHand()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("mia", "Mia", "Schwarzwälder")
                        .AddMembership("mia-by-hand", "mia", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (_, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("mia"));

        Assert.Null(Assert.Single(result.Memberships).Admission);
    }

    [Fact]
    public async Task Should_ShowWhoChangedTheContactDetailsAndWhen_When_TheyWereChanged()
    {
        var ct = TestContext.Current.CancellationToken;
        var changedAt = _fixture.TimeProvider.GetUtcNow().AddDays(-3);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPerson("anna", "Anna", "Kessler")
                        .AddContactChange("paula", "anna", changedAt)
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var change = Assert.IsType<PersonContactChangeDto>(result.ContactChange);
        Assert.Equal(changedAt, change.At);
        Assert.NotNull(change.ChangedBy);
        Assert.Equal(ctx.Identity.People.IdOf("anna"), change.ChangedBy.PersonId);
        Assert.Equal("Anna", change.ChangedBy.FirstName);
        Assert.Equal("Kessler", change.ChangedBy.LastName);
    }

    [Fact]
    public async Task Should_ShowTheContactChangeNamingNobody_When_TheEditorWasDeleted()
    {
        var ct = TestContext.Current.CancellationToken;
        var changedAt = _fixture.TimeProvider.GetUtcNow().AddDays(-3);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPerson("anna", "Anna", "Kessler")
                        .AddContactChange("paula", "anna", changedAt)
                ),
            ct
        );
        await _fixture.DeletePersonDirectlyAsync(ctx.Identity.People.IdOf("anna"), ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var change = Assert.IsType<PersonContactChangeDto>(result.ContactChange);
        Assert.Equal(changedAt, change.At);
        Assert.Null(change.ChangedBy);
    }

    [Fact]
    public async Task Should_ShowNoContactChange_When_TheContactDetailsWereNeverChanged()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity => identity.AddPerson("paula", "Paula", "Brendel")),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Null(result.ContactChange);
    }

    [Fact]
    public async Task Should_LetTheViewerManageTheAccount_When_SheHoldsAccountsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddPerson("anna", "Anna", "Muster")),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (response, result) = await ReadPersonAsync(client, ctx.Identity.People.IdOf("anna"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(result.Access.Rights.CanInvite);
        Assert.True(result.Access.Rights.CanManageAccount);
        Assert.Equal(ClubRecord.DefaultAgeOfConsent, result.Access.AgeOfConsent);
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
