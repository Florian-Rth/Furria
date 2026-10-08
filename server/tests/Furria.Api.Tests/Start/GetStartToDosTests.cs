using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.MembershipApplications;
using Furria.Api.Endpoints.Start;
using Furria.Api.Tests.Auth;
using Furria.Api.Tests.Invitations;
using Furria.Api.Tests.ToDos;
using Furria.Application.Authorization;
using Furria.Application.Management;
using Furria.Application.Start;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Start;

public sealed class GetStartToDosTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly JoinedIn2015 = new(2015, 11, 11);
    private static readonly DateOnly Today = new(2027, 1, 19);
    private static readonly DateOnly Yesterday = new(2027, 1, 18);
    private static readonly DateOnly Tomorrow = new(2027, 1, 20);
    private static readonly DateOnly SessionEnd = new(2027, 11, 10);

    private static readonly DateTimeOffset TuesdayEvening = new(
        2027,
        1,
        19,
        18,
        50,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public GetStartToDosTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CountNeverInvited_When_TheViewerManagesPersons()
    {
        await OnTuesdayEveningAsync(
            identity =>
                identity
                    .AddEligiblePerson(
                        "anna",
                        "Anna",
                        InvitationSteps.UniqueContactEmail("anna"),
                        Today
                    )
                    .AddEligiblePerson(
                        "ben",
                        "Ben",
                        InvitationSteps.UniqueContactEmail("ben"),
                        Today
                    ),
            async ctx =>
            {
                var toDos = ToDosOf(await StartOfAsync(ctx, "frank"));

                Assert.Equal(2, CountOf(toDos, ToDoKind.NeverInvited));
            }
        );
    }

    [Fact]
    public async Task Should_CountDueReminders_When_AnInvitationLiesPastTheReminderDelay()
    {
        await OnTuesdayEveningAsync(
            identity =>
                identity.AddEligiblePerson(
                    "carl",
                    "Carl",
                    InvitationSteps.UniqueContactEmail("carl"),
                    Today
                ),
            async ctx =>
            {
                var manager = await ctx.Identity.ManagingLoginClientAsync(
                    TestContext.Current.CancellationToken
                );
                await InvitationSteps.InviteAsync(manager, ctx.Identity.People.IdOf("carl"));

                await _fixture.AtLaterTimeAsync(
                    InvitationRoundSteps.PastTheReminderDelay,
                    async () =>
                    {
                        var toDos = ToDosOf(await StartOfAsync(ctx, "frank"));

                        Assert.Equal(1, CountOf(toDos, ToDoKind.ReminderDue));
                        Assert.Null(CountOf(toDos, ToDoKind.NeverInvited));
                    }
                );
            }
        );
    }

    [Fact]
    public async Task Should_CountInPersonOnly_When_AnEligiblePersonHasNoEmail()
    {
        await OnTuesdayEveningAsync(
            identity =>
                identity
                    .AddPerson("dora", "Dora", "Ohnemail")
                    .AddPersonContact("dora", birthDate: Today.AddYears(-40), withoutEmail: true)
                    .AddMembership("dora-member", "dora", JoinedIn2015),
            async ctx =>
            {
                var toDos = ToDosOf(await StartOfAsync(ctx, "frank"));

                Assert.Equal(1, CountOf(toDos, ToDoKind.InPersonOnly));
                Assert.Null(CountOf(toDos, ToDoKind.NeverInvited));
            }
        );
    }

    [Fact]
    public async Task Should_CountUnknownBirthDates_When_TheViewerManagesPersonsAndAccounts()
    {
        await OnTuesdayEveningAsync(
            identity =>
                identity
                    .AddPerson("emil", "Emil", "Ohnedatum")
                    .AddMembership("emil-member", "emil", JoinedIn2015),
            async ctx =>
            {
                var toDos = ToDosOf(await StartOfAsync(ctx, "frank"));

                Assert.Equal(1, CountOf(toDos, ToDoKind.BirthDateUnknown));
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutUnknownBirthDates_When_TheViewerManagesAccountsAlone()
    {
        await OnTuesdayEveningAsync(
            identity =>
                identity
                    .AddPerson("emil", "Emil", "Ohnedatum")
                    .AddMembership("emil-member", "emil", JoinedIn2015),
            async ctx =>
            {
                var toDos = ToDosOf(await StartOfAsync(ctx, "vera"));

                Assert.Empty(toDos);
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutUnknownBirthDates_When_TheViewerManagesPersonsAlone()
    {
        await OnTuesdayEveningAsync(
            identity =>
                identity
                    .AddEligiblePerson(
                        "anna",
                        "Anna",
                        InvitationSteps.UniqueContactEmail("anna"),
                        Today
                    )
                    .AddPerson("emil", "Emil", "Ohnedatum")
                    .AddMembership("emil-member", "emil", JoinedIn2015),
            async ctx =>
            {
                var toDos = ToDosOf(await StartOfAsync(ctx, "petra"));

                Assert.Equal(1, CountOf(toDos, ToDoKind.NeverInvited));
                Assert.Null(CountOf(toDos, ToDoKind.BirthDateUnknown));
            }
        );
    }

    [Fact]
    public async Task Should_CountAKeyToTakeBack_When_TheHoldersLastTieEnded()
    {
        await OnTuesdayEveningAsync(
            identity =>
                identity
                    .AddPerson("hanna", "Hanna", "Ausgetreten")
                    .AddMembership("hanna-member", "hanna", JoinedIn2015, Yesterday),
            async ctx =>
            {
                var toDos = ToDosOf(await StartOfAsync(ctx, "maik"));

                Assert.Equal(1, CountOf(toDos, ToDoKind.KeyToTakeBack));
            },
            club => club.AddKeyHolding("hanna-sporthalle", "sporthalle", "hanna", JoinedIn2015)
        );
    }

    [Fact]
    public async Task Should_LeaveOutTheKey_When_ItsReturnIsRecordedForToday()
    {
        await AssertKeyToTakeBackCountAsync(
            expected: null,
            club =>
                club.AddKeyHolding("hanna-sporthalle", "sporthalle", "hanna", JoinedIn2015, Today)
        );
    }

    [Fact]
    public async Task Should_LeaveOutTheKey_When_ItsReturnIsDatedAhead()
    {
        await AssertKeyToTakeBackCountAsync(
            expected: null,
            club =>
                club.AddKeyHolding(
                    "hanna-sporthalle",
                    "sporthalle",
                    "hanna",
                    JoinedIn2015,
                    SessionEnd
                )
        );
    }

    [Fact]
    public async Task Should_CountTheKey_When_ItIsHandedOutAheadToAnInactiveHolder()
    {
        await AssertKeyToTakeBackCountAsync(
            expected: 1,
            club => club.AddKeyHolding("hanna-sporthalle", "sporthalle", "hanna", Tomorrow)
        );
    }

    [Fact]
    public async Task Should_LeaveOutTheKey_When_TheHolderOnlyAdministersAGroup()
    {
        await OnTuesdayEveningAsync(
            identity => identity.AddPerson("sabine", "Sabine", "Trainerin"),
            async ctx =>
            {
                var toDos = ToDosOf(await StartOfAsync(ctx, "maik"));

                Assert.Null(CountOf(toDos, ToDoKind.KeyToTakeBack));
            },
            club => club.AddKeyHolding("sabine-sporthalle", "sporthalle", "sabine", JoinedIn2015),
            groups =>
                groups
                    .AddGroup("kindergarde", "Kindergarde")
                    .AddGroupAdmin(
                        "sabine-kindergarde",
                        "kindergarde",
                        "sabine",
                        "Trainerin",
                        JoinedIn2015
                    )
        );
    }

    [Fact]
    public async Task Should_CountClubRecordGaps_When_TheViewerManagesTheClub()
    {
        await OnTuesdayEveningAsync(
            identity => identity,
            async ctx =>
            {
                var toDos = ToDosOf(await StartOfAsync(ctx, "frank"));

                Assert.Equal(2, CountOf(toDos, ToDoKind.ClubRecordGap));
            },
            club => club.SetClubRecord(name: "Karnevalsklub Furria", foundedYear: 1971)
        );
    }

    [Fact]
    public async Task Should_CountWaitingApplications_When_TheViewerDecidesApplicationsAlone()
    {
        await OnTuesdayEveningAsync(
            identity =>
                identity
                    .AddMembershipApplication("mia", Today.AddYears(-17))
                    .AddMembershipApplication("nora", Today.AddYears(-40)),
            async ctx =>
            {
                var toDos = ToDosOf(await StartOfAsync(ctx, "dana"));

                Assert.Equal([ToDoKind.ApplicationWaiting], toDos.Select(toDo => toDo.Kind));
                Assert.Equal(2, CountOf(toDos, ToDoKind.ApplicationWaiting));
            }
        );
    }

    [Fact]
    public async Task Should_ShowEveryToDoAndNoInactiveState_When_TheManagingLoginOpensStart()
    {
        await OnTuesdayEveningAsync(
            identity => identity.AddMembershipApplication("mia", Today.AddYears(-17)),
            async ctx =>
            {
                var start = await StartOfAsync(
                    await ctx.Identity.ManagingLoginClientAsync(
                        TestContext.Current.CancellationToken
                    )
                );

                Assert.True(start.ViewerIsActiveInClub);
                Assert.Equal(1, CountOf(ToDosOf(start), ToDoKind.ApplicationWaiting));
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutAnApplication_When_ItIsNotYetConfirmed()
    {
        await OnTuesdayEveningAsync(
            identity =>
                identity
                    .AddMembershipApplication("mia", Today.AddYears(-17))
                    .AddMembershipApplication("olga", Today.AddYears(-30), unconfirmed: true),
            async ctx =>
            {
                var toDos = ToDosOf(await StartOfAsync(ctx, "dana"));

                Assert.Equal(1, CountOf(toDos, ToDoKind.ApplicationWaiting));
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutAnApplication_When_ItIsDeclined()
    {
        await OnTuesdayEveningAsync(
            identity => identity.AddMembershipApplication("mia", Today.AddYears(-17)),
            async ctx =>
            {
                var client = await ctx.Identity.ClientForAsync(
                    "dana",
                    TestContext.Current.CancellationToken
                );
                var before = ToDosOf(await StartOfAsync(client));

                await DeclineAsync(client, ctx.Identity.MembershipApplications.IdOf("mia"));
                var after = ToDosOf(await StartOfAsync(client));

                Assert.Equal(1, CountOf(before, ToDoKind.ApplicationWaiting));
                Assert.Null(CountOf(after, ToDoKind.ApplicationWaiting));
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutWaitingApplications_When_TheViewerDoesNotDecideThem()
    {
        await OnTuesdayEveningAsync(
            identity => identity.AddMembershipApplication("mia", Today.AddYears(-17)),
            async ctx =>
            {
                var toDos = ToDosOf(await StartOfAsync(ctx, "frank"));

                Assert.Null(CountOf(toDos, ToDoKind.ApplicationWaiting));
            }
        );
    }

    [Fact]
    public async Task Should_CountWaitingTicketRequests_When_TheViewerHandlesThem()
    {
        await OnTuesdayEveningAsync(
            identity => identity,
            async ctx =>
            {
                var toDos = ToDosOf(await StartOfAsync(ctx, "tina"));

                Assert.Equal([ToDoKind.TicketRequestWaiting], toDos.Select(toDo => toDo.Kind));
                Assert.Equal(2, CountOf(toDos, ToDoKind.TicketRequestWaiting));
            },
            WithTwoTicketRequests
        );
    }

    [Fact]
    public async Task Should_LeaveOutWaitingTicketRequests_When_TheViewerDoesNotHandleThem()
    {
        await OnTuesdayEveningAsync(
            identity => identity,
            async ctx =>
            {
                var toDos = ToDosOf(await StartOfAsync(ctx, "frank"));

                Assert.Null(CountOf(toDos, ToDoKind.TicketRequestWaiting));
            },
            WithTwoTicketRequests
        );
    }

    [Fact]
    public async Task Should_ShowOnlyKeyWork_When_TheViewerManagesKeysAlone()
    {
        await OnTuesdayEveningAsync(
            identity =>
                identity
                    .AddEligiblePerson(
                        "anna",
                        "Anna",
                        InvitationSteps.UniqueContactEmail("anna"),
                        Today
                    )
                    .AddPerson("emil", "Emil", "Ohnedatum")
                    .AddMembership("emil-member", "emil", JoinedIn2015)
                    .AddPerson("hanna", "Hanna", "Ausgetreten")
                    .AddMembership("hanna-member", "hanna", JoinedIn2015, Yesterday),
            async ctx =>
            {
                var toDos = ToDosOf(await StartOfAsync(ctx, "maik"));

                Assert.Equal([ToDoKind.KeyToTakeBack], toDos.Select(toDo => toDo.Kind));
            },
            club => club.AddKeyHolding("hanna-sporthalle", "sporthalle", "hanna", JoinedIn2015)
        );
    }

    [Fact]
    public async Task Should_LeaveOutAToDo_When_ItsWorkIsDone()
    {
        await OnTuesdayEveningAsync(
            identity =>
                identity.AddEligiblePerson(
                    "anna",
                    "Anna",
                    InvitationSteps.UniqueContactEmail("anna"),
                    Today
                ),
            async ctx =>
            {
                var client = await ctx.Identity.ClientForAsync(
                    "frank",
                    TestContext.Current.CancellationToken
                );
                var before = ToDosOf(await StartOfAsync(client));

                await InvitationRoundSteps.InviteAllAsync(client);
                var after = ToDosOf(await StartOfAsync(client));

                Assert.Equal(1, CountOf(before, ToDoKind.NeverInvited));
                Assert.Null(CountOf(after, ToDoKind.NeverInvited));
            }
        );
    }

    [Fact]
    public async Task Should_ShowNoClubWork_When_TheViewerHoldsNoKey()
    {
        await OnTuesdayEveningAsync(
            identity =>
                identity
                    .AddEligiblePerson(
                        "anna",
                        "Anna",
                        InvitationSteps.UniqueContactEmail("anna"),
                        Today
                    )
                    .AddPerson("emil", "Emil", "Ohnedatum")
                    .AddMembership("emil-member", "emil", JoinedIn2015)
                    .AddPerson("hanna", "Hanna", "Ausgetreten")
                    .AddMembership("hanna-member", "hanna", JoinedIn2015, Yesterday),
            async ctx =>
            {
                var start = await StartOfAsync(ctx, "lena");

                Assert.True(start.ViewerIsActiveInClub);
                Assert.DoesNotContain(start.Panels, panel => panel.Kind == StartPanelKind.ToDos);
            },
            club => club.AddKeyHolding("hanna-sporthalle", "sporthalle", "hanna", JoinedIn2015)
        );
    }

    [Fact]
    public async Task Should_LeaveOutASeenToDo_When_NothingJoinedIt()
    {
        await OnTuesdayEveningAsync(
            identity =>
                identity
                    .AddPerson("hanna", "Hanna", "Ausgetreten")
                    .AddMembership("hanna-member", "hanna", JoinedIn2015, Yesterday),
            async ctx =>
            {
                var keyWarden = await ctx.Identity.ClientForAsync(
                    "maik",
                    TestContext.Current.CancellationToken
                );
                await ToDoSteps.MarkShownAsSeenAsync(keyWarden, ToDoKind.KeyToTakeBack);

                var start = await StartOfAsync(keyWarden);

                Assert.DoesNotContain(start.Panels, panel => panel.Kind == StartPanelKind.ToDos);
            },
            club => club.AddKeyHolding("hanna-sporthalle", "sporthalle", "hanna", JoinedIn2015)
        );
    }

    [Fact]
    public async Task Should_BringASeenToDoBack_When_SomethingNewJoinsIt()
    {
        await OnTuesdayEveningAsync(
            identity =>
                identity
                    .AddPerson("hanna", "Hanna", "Ausgetreten")
                    .AddMembership("hanna-member", "hanna", JoinedIn2015, Yesterday),
            async ctx =>
            {
                var keyWarden = await ctx.Identity.ClientForAsync(
                    "maik",
                    TestContext.Current.CancellationToken
                );
                await ToDoSteps.MarkShownAsSeenAsync(keyWarden, ToDoKind.KeyToTakeBack);
                await ToDoSteps.HandOutKeyAsync(
                    keyWarden,
                    ctx.Club.Venues.IdOf("vereinsheim"),
                    ctx.Identity.People.IdOf("hanna"),
                    JoinedIn2015
                );

                var toDos = ToDosOf(await StartOfAsync(keyWarden));

                Assert.Equal(2, CountOf(toDos, ToDoKind.KeyToTakeBack));
            },
            club =>
                club.AddVenue("vereinsheim", "Vereinsheim")
                    .AddKeyHolding("hanna-sporthalle", "sporthalle", "hanna", JoinedIn2015)
        );
    }

    [Fact]
    public async Task Should_KeepOtherViewersToDo_When_OneViewerMarksItSeen()
    {
        await OnTuesdayEveningAsync(
            identity => identity.AddMembershipApplication("mia", Today.AddYears(-17)),
            async ctx =>
            {
                var ct = TestContext.Current.CancellationToken;
                var decider = await ctx.Identity.ClientForAsync("dana", ct);
                await ToDoSteps.MarkShownAsSeenAsync(decider, ToDoKind.ApplicationWaiting);

                var mine = ToDosOf(await StartOfAsync(decider));
                var theAdmins = ToDosOf(
                    await StartOfAsync(await ctx.Identity.ManagingLoginClientAsync(ct))
                );

                Assert.Null(CountOf(mine, ToDoKind.ApplicationWaiting));
                Assert.Equal(1, CountOf(theAdmins, ToDoKind.ApplicationWaiting));
            }
        );
    }

    private async Task AssertKeyToTakeBackCountAsync(
        int? expected,
        Action<ClubSeedBuilder> arrangeKey
    )
    {
        await OnTuesdayEveningAsync(
            identity =>
                identity
                    .AddPerson("hanna", "Hanna", "Ausgetreten")
                    .AddMembership("hanna-member", "hanna", JoinedIn2015, Yesterday),
            async ctx =>
            {
                var toDos = ToDosOf(await StartOfAsync(ctx, "maik"));

                Assert.Equal(expected, CountOf(toDos, ToDoKind.KeyToTakeBack));
            },
            arrangeKey
        );
    }

    private static async Task DeclineAsync(HttpClient client, int membershipApplicationId)
    {
        var response = await client.DELETEAsync<
            DeleteMembershipApplicationById,
            DeleteMembershipApplicationByIdRequest
        >(
            new DeleteMembershipApplicationByIdRequest
            {
                MembershipApplicationId = membershipApplicationId,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    private static void WithTwoTicketRequests(ClubSeedBuilder club) =>
        club.AddEvent("gala", "1. Prunksitzung", TuesdayEvening.AddDays(4), "sporthalle")
            .AddTicketRequest("mia-gala", "gala", "Mia Gast", "mia@guest.test")
            .AddTicketRequest("ole-gala", "gala", "Ole Gast", "ole@guest.test");

    private static IReadOnlyList<StartToDoDto> ToDosOf(GetStartResponse start) =>
        start.Panels.SingleOrDefault(panel => panel.Kind == StartPanelKind.ToDos)?.ToDos ?? [];

    private static int? CountOf(IReadOnlyList<StartToDoDto> toDos, ToDoKind kind) =>
        toDos.SingleOrDefault(toDo => toDo.Kind == kind)?.Count;

    private static async Task<GetStartResponse> StartOfAsync(SeededContext ctx, string alias) =>
        await StartOfAsync(
            await ctx.Identity.ClientForAsync(alias, TestContext.Current.CancellationToken)
        );

    private static async Task<GetStartResponse> StartOfAsync(HttpClient client)
    {
        var (response, start) = await client.GETAsync<GetStart, GetStartResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return start;
    }

    private async Task OnTuesdayEveningAsync(
        Func<IdentitySeedBuilder, IdentitySeedBuilder> arrangePeople,
        Func<SeededContext, Task> actAndAssert,
        Action<ClubSeedBuilder>? arrangeClub = null,
        Action<GroupSeedBuilder>? arrangeGroups = null
    )
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            TuesdayEvening,
            async () =>
            {
                var ctx = await _fixture.BuildAsync(
                    builder =>
                    {
                        builder
                            .Identity(identity =>
                                arrangePeople(
                                    identity
                                        .AddPerson("frank", "Frank", "Präsident")
                                        .AddAccount("frank")
                                        .AddMembership("frank-member", "frank", JoinedIn2015)
                                        .AddPerson("maik", "Maik", "Schlüsselwart")
                                        .AddAccount("maik")
                                        .AddPerson("vera", "Vera", "Zugänge")
                                        .AddAccount("vera")
                                        .AddPerson("petra", "Petra", "Register")
                                        .AddAccount("petra")
                                        .AddPerson("dana", "Dana", "Aufnahme")
                                        .AddAccount("dana")
                                        .AddPerson("tina", "Tina", "Kartenanfragen")
                                        .AddAccount("tina")
                                        .AddPerson("lena", "Lena", "Garde")
                                        .AddAccount("lena")
                                        .AddMembership("lena-member", "lena", JoinedIn2015)
                                )
                            )
                            .Roles(roles =>
                                roles
                                    .AddRole(
                                        "vorstand",
                                        "Vorstand",
                                        FurriaPermissions.PersonsManage,
                                        FurriaPermissions.AccountsManage,
                                        FurriaPermissions.AnnouncementsPost,
                                        FurriaPermissions.ClubManage
                                    )
                                    .AddRoleWithHolder(
                                        "schluesselwart",
                                        "maik-schluesselwart",
                                        "Schlüsselwart",
                                        "maik",
                                        FurriaPermissions.KeyHoldingsManage
                                    )
                                    .AddRoleWithHolder(
                                        "zugaenge",
                                        "vera-zugaenge",
                                        "Zugänge",
                                        "vera",
                                        FurriaPermissions.AccountsManage
                                    )
                                    .AddRoleWithHolder(
                                        "aufnahme",
                                        "dana-aufnahme",
                                        "Aufnahme",
                                        "dana",
                                        FurriaPermissions.MembershipApplicationsDecide
                                    )
                                    .AddRoleWithHolder(
                                        "kartenanfragen",
                                        "tina-kartenanfragen",
                                        "Kartenanfragen",
                                        "tina",
                                        FurriaPermissions.TicketRequestsHandle
                                    )
                                    .AddRoleWithHolder(
                                        "register",
                                        "petra-register",
                                        "Register",
                                        "petra",
                                        FurriaPermissions.PersonsManage
                                    )
                            )
                            .Groups(groups => arrangeGroups?.Invoke(groups))
                            .Club(club =>
                            {
                                club.AddVenue("sporthalle", "Sporthalle Am Ring")
                                    .AddBoardOffice(
                                        "praesident",
                                        "Präsident",
                                        impliedRoleAlias: "vorstand"
                                    )
                                    .AddBoardSeat(
                                        "frank-praesident",
                                        "praesident",
                                        "frank",
                                        JoinedIn2015
                                    );
                                arrangeClub?.Invoke(club);
                            });
                    },
                    ct
                );

                await actAndAssert(ctx);
            }
        );
    }
}
