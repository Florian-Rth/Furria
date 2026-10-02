using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Start;
using Furria.Api.Tests.Auth;
using Furria.Api.Tests.Invitations;
using Furria.Application.Authorization;
using Furria.Application.Management;
using Furria.Application.Start;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Start;

[Collection("Api")]
public sealed class GetStartToDosTests
{
    private static readonly DateOnly JoinedIn2015 = new(2015, 11, 11);
    private static readonly DateOnly Today = new(2027, 1, 19);
    private static readonly DateOnly Yesterday = new(2027, 1, 18);

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
                var manager = await ctx.Identity.BootstrapAdminClientAsync(
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
                    .AddMembership("emil-member", "emil", JoinedIn2015),
            async ctx =>
            {
                var start = await StartOfAsync(ctx, "lena");

                Assert.True(start.ViewerIsActiveInClub);
                Assert.DoesNotContain(start.Panels, panel => panel.Kind == StartPanelKind.ToDos);
            }
        );
    }

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
