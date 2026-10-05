using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Start;
using Furria.Application.Authorization;
using Furria.Application.Start;
using Furria.Core.Groups;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Start;

[Collection("Api")]
public sealed class GetStartMineTests
{
    private const int PausedSessionYear = 2026;

    private static readonly DateOnly JoinedIn2015 = new(2015, 11, 11);
    private static readonly DateOnly Today = new(2027, 1, 19);
    private static readonly DateOnly ThirteenDaysAgo = new(2027, 1, 6);
    private static readonly DateOnly FourteenDaysAgo = new(2027, 1, 5);
    private static readonly DateOnly LastWeek = new(2027, 1, 12);
    private static readonly DateOnly LastSummer = new(2026, 6, 30);
    private static readonly DateOnly MidFebruary = new(2027, 2, 15);
    private static readonly DateOnly FiftyYearsBeforeLastWeek = new(1977, 1, 12);
    private static readonly DateOnly FiftyYearsBeforeToday = new(1977, 1, 19);

    private static readonly DateTimeOffset TuesdayEvening = new(
        2027,
        1,
        19,
        18,
        50,
        0,
        TimeSpan.Zero
    );

    private static readonly DateTimeOffset LateOctoberMorning = new(
        2026,
        10,
        20,
        8,
        0,
        0,
        TimeSpan.Zero
    );

    private static readonly DateTimeOffset LastWeeksChange = new(
        2027,
        1,
        12,
        10,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public GetStartMineTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_AnnounceANewRoleWithItsKeys_When_HerHoldingStartedWithinTwoWeeks()
    {
        await OnTuesdayEveningAsync(
            "lena",
            builder =>
                builder.Roles(roles =>
                    roles
                        .AddRole(
                            "aushang",
                            "Aushang",
                            FurriaPermissions.PersonsManage,
                            FurriaPermissions.AnnouncementsPost
                        )
                        .AddRoleHolding("lena-aushang", "aushang", "lena", ThirteenDaysAgo)
                ),
            (ctx, mine) =>
            {
                var role = Assert.Single(mine, item => item.Kind == StartMineKind.NewRole);

                Assert.Equal(ctx.Roles.Roles.IdOf("aushang"), role.SubjectId);
                Assert.Equal(ThirteenDaysAgo, role.On);
                Assert.Equal(Today, role.Until);
                Assert.Equal("Aushang", role.Name);
                Assert.Equal(
                    [FurriaPermissions.AnnouncementsPost, FurriaPermissions.PersonsManage],
                    role.PermissionKeys
                );
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutARole_When_HerHoldingStartedEarlier()
    {
        await OnTuesdayEveningAsync(
            "lena",
            builder =>
                builder.Roles(roles =>
                    roles
                        .AddRole("aushang", "Aushang", FurriaPermissions.AnnouncementsPost)
                        .AddRoleHolding("lena-aushang", "aushang", "lena", FourteenDaysAgo)
                ),
            (_, mine) => Assert.DoesNotContain(mine, item => item.Kind == StartMineKind.NewRole)
        );
    }

    [Fact]
    public async Task Should_LeaveOutANewRole_When_TheRoleIsArchived()
    {
        await OnTuesdayEveningAsync(
            "lena",
            builder =>
                builder.Roles(roles =>
                    roles
                        .AddRoleWithDetails(
                            "aushang",
                            "Aushang",
                            "",
                            Today,
                            FurriaPermissions.AnnouncementsPost
                        )
                        .AddRoleHolding("lena-aushang", "aushang", "lena", LastWeek)
                ),
            (_, mine) => Assert.DoesNotContain(mine, item => item.Kind == StartMineKind.NewRole)
        );
    }

    [Fact]
    public async Task Should_AnnounceANewBoardSeat_When_HerSeatStartedWithinTwoWeeks()
    {
        await OnTuesdayEveningAsync(
            "lena",
            builder =>
                builder
                    .Roles(roles =>
                        roles.AddRole(
                            "vorstand",
                            "Vorstand",
                            FurriaPermissions.ClubManage,
                            FurriaPermissions.AnnouncementsPost
                        )
                    )
                    .Club(club =>
                        club.AddBoardOffice(
                                "schriftfuehrung",
                                "Schriftführerin",
                                impliedRoleAlias: "vorstand"
                            )
                            .AddBoardSeat(
                                "lena-schriftfuehrung",
                                "schriftfuehrung",
                                "lena",
                                LastWeek
                            )
                    ),
            (ctx, mine) =>
            {
                var seat = Assert.Single(mine, item => item.Kind == StartMineKind.NewBoardSeat);

                Assert.Equal(ctx.Club.BoardOffices.IdOf("schriftfuehrung"), seat.SubjectId);
                Assert.Equal(LastWeek, seat.On);
                Assert.Equal(LastWeek.AddDays(13), seat.Until);
                Assert.Equal("Schriftführerin", seat.Name);
                Assert.Equal(
                    [FurriaPermissions.AnnouncementsPost, FurriaPermissions.ClubManage],
                    seat.PermissionKeys
                );
            }
        );
    }

    [Fact]
    public async Task Should_AnnounceANewGroupAdmin_When_HerTenureStartedWithinTwoWeeks()
    {
        await OnTuesdayEveningAsync(
            "lena",
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroup("kindergarde", "Kindergarde", tone: GroupTone.Teal)
                        .AddGroupAdmin(
                            "lena-kindergarde",
                            "kindergarde",
                            "lena",
                            "Trainerin",
                            LastWeek
                        )
                ),
            (ctx, mine) =>
            {
                var tenure = Assert.Single(mine, item => item.Kind == StartMineKind.NewGroupAdmin);

                Assert.Equal(ctx.Groups.Groups.IdOf("kindergarde"), tenure.SubjectId);
                Assert.Equal(LastWeek, tenure.On);
                Assert.Equal(LastWeek.AddDays(13), tenure.Until);
                Assert.Equal("Kindergarde", tenure.Name);
                Assert.Equal(GroupTone.Teal, tenure.GroupTone);
                Assert.Equal("Trainerin", tenure.Function);
            }
        );
    }

    [Fact]
    public async Task Should_AnnounceANewGroupMembership_When_SheJoinedWithinTwoWeeks()
    {
        await OnTuesdayEveningAsync(
            "lena",
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroup("tanzgarde", "Tanzgarde", tone: GroupTone.Rose)
                        .AddGroupMembership("lena-tanzgarde", "tanzgarde", "lena", LastWeek)
                ),
            (ctx, mine) =>
            {
                var membership = Assert.Single(
                    mine,
                    item => item.Kind == StartMineKind.NewGroupMembership
                );

                Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), membership.SubjectId);
                Assert.Equal(LastWeek, membership.On);
                Assert.Equal(LastWeek.AddDays(13), membership.Until);
                Assert.Equal("Tanzgarde", membership.Name);
                Assert.Equal(GroupTone.Rose, membership.GroupTone);
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutANewGroupMembership_When_TheGroupIsArchived()
    {
        await OnTuesdayEveningAsync(
            "lena",
            builder =>
                builder.Groups(groups =>
                    groups
                        .AddGroup("altgarde", "Altgarde", archivedOn: Today)
                        .AddGroupMembership("lena-altgarde", "altgarde", "lena", LastWeek)
                ),
            (_, mine) =>
                Assert.DoesNotContain(mine, item => item.Kind == StartMineKind.NewGroupMembership)
        );
    }

    [Fact]
    public async Task Should_AnnounceANewKey_When_HerHoldingStartedWithinTwoWeeks()
    {
        await OnTuesdayEveningAsync(
            "lena",
            builder =>
                builder.Club(club =>
                    club.AddVenue("festhalle", "Festhalle Großfurra")
                        .AddKeyHolding("lena-festhalle", "festhalle", "lena", LastWeek)
                ),
            (ctx, mine) =>
            {
                var key = Assert.Single(mine, item => item.Kind == StartMineKind.NewKey);

                Assert.Equal(ctx.Club.Venues.IdOf("festhalle"), key.SubjectId);
                Assert.Equal(LastWeek, key.On);
                Assert.Equal(LastWeek.AddDays(13), key.Until);
                Assert.Equal("Festhalle Großfurra", key.Name);
            }
        );
    }

    [Fact]
    public async Task Should_TellHerOfAContactChange_When_SomeoneElseChangedHerDetails()
    {
        await OnTuesdayEveningAsync(
            "lena",
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("frank", "Frank", "Präsident")
                        .AddContactChange("lena", "frank", LastWeeksChange)
                ),
            (ctx, mine) =>
            {
                var change = Assert.Single(
                    mine,
                    item => item.Kind == StartMineKind.ContactChangedByOther
                );

                Assert.Null(change.SubjectId);
                Assert.Equal(LastWeek, change.On);
                Assert.Equal(LastWeek.AddDays(14), change.Until);
                Assert.NotNull(change.ChangedBy);
                Assert.Equal(ctx.Identity.People.IdOf("frank"), change.ChangedBy.PersonId);
                Assert.Equal("Frank", change.ChangedBy.FirstName);
                Assert.Equal("Präsident", change.ChangedBy.LastName);
            }
        );
    }

    [Fact]
    public async Task Should_StayQuiet_When_SheChangedHerOwnDetails()
    {
        await OnTuesdayEveningAsync(
            "lena",
            builder =>
                builder.Identity(identity =>
                    identity.AddContactChange("lena", "lena", LastWeeksChange)
                ),
            (_, mine) =>
                Assert.DoesNotContain(
                    mine,
                    item => item.Kind == StartMineKind.ContactChangedByOther
                )
        );
    }

    [Fact]
    public async Task Should_TellHerOfTheMembershipEnd_When_ItEndsWithinAMonth()
    {
        await OnTuesdayEveningAsync(
            "gerd",
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("gerd", "Gerd", "Förderer")
                        .AddAccount("gerd")
                        .AddMembership("gerd-member", "gerd", JoinedIn2015, MidFebruary)
                ),
            (_, mine) =>
            {
                var ending = Assert.Single(
                    mine,
                    item => item.Kind == StartMineKind.MembershipEnding
                );

                Assert.Null(ending.SubjectId);
                Assert.Equal(MidFebruary, ending.On);
                Assert.Equal(MidFebruary, ending.Until);
            }
        );
    }

    [Fact]
    public async Task Should_StayQuietAboutTheEnd_When_HerNextMembershipStartsTheDayAfter()
    {
        await OnTuesdayEveningAsync(
            "gerd",
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("gerd", "Gerd", "Förderer")
                        .AddAccount("gerd")
                        .AddMembership("gerd-member", "gerd", JoinedIn2015, MidFebruary)
                        .AddMembership("gerd-renewed", "gerd", MidFebruary.AddDays(1))
                ),
            (_, mine) =>
                Assert.DoesNotContain(mine, item => item.Kind == StartMineKind.MembershipEnding)
        );
    }

    [Fact]
    public async Task Should_TellHerOfThePause_When_HerPausedSessionOpensWithinAMonth()
    {
        await AtAsync(
            LateOctoberMorning,
            "paula",
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Pause")
                        .AddAccount("paula")
                        .AddMembership("paula-member", "paula", JoinedIn2015)
                        .AddMembershipPause(
                            "paula-pause",
                            "paula-member",
                            PausedSessionYear,
                            PausedSessionYear
                        )
                ),
            (_, mine) =>
            {
                var pause = Assert.Single(
                    mine,
                    item => item.Kind == StartMineKind.MembershipPaused
                );

                Assert.Null(pause.SubjectId);
                Assert.Equal(new DateOnly(2026, 11, 11), pause.On);
                Assert.Equal(new DateOnly(2026, 11, 24), pause.Until);
                Assert.Equal(PausedSessionYear, pause.SessionStartYear);
            }
        );
    }

    [Fact]
    public async Task Should_MarkHerMilestone_When_AFiftiethAnniversaryPassedLastWeek()
    {
        await OnTuesdayEveningAsync(
            "gerd",
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("gerd", "Gerd", "Förderer")
                        .AddAccount("gerd")
                        .AddMembership("gerd-member", "gerd", FiftyYearsBeforeLastWeek)
                ),
            (_, mine) =>
            {
                var milestone = Assert.Single(mine, item => item.Kind == StartMineKind.Milestone);

                Assert.Null(milestone.SubjectId);
                Assert.Equal(LastWeek, milestone.On);
                Assert.Equal(LastWeek.AddDays(30), milestone.Until);
                Assert.Equal(50, milestone.Years);
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutTheMilestone_When_TheAnniversaryIsToday()
    {
        await OnTuesdayEveningAsync(
            "gerd",
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("gerd", "Gerd", "Förderer")
                        .AddAccount("gerd")
                        .AddMembership("gerd-member", "gerd", FiftyYearsBeforeToday)
                ),
            (_, mine) => Assert.DoesNotContain(mine, item => item.Kind == StartMineKind.Milestone)
        );
    }

    [Fact]
    public async Task Should_ShowOnlyHerOwnRecord_When_SomeoneElseGotNewTies()
    {
        await OnTuesdayEveningAsync(
            "lena",
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("frank", "Frank", "Präsident")
                            .AddMembership("frank-member", "frank", FiftyYearsBeforeLastWeek)
                            .AddContactChange("frank", "lena", LastWeeksChange)
                    )
                    .Roles(roles =>
                        roles
                            .AddRole("aushang", "Aushang", FurriaPermissions.AnnouncementsPost)
                            .AddRoleHolding("frank-aushang", "aushang", "frank", LastWeek)
                    )
                    .Club(club =>
                        club.AddVenue("festhalle", "Festhalle Großfurra")
                            .AddKeyHolding("frank-festhalle", "festhalle", "frank", LastWeek)
                    ),
            (_, mine) => Assert.Empty(mine)
        );
    }

    [Fact]
    public async Task Should_LeaveOutMine_When_NothingIsNewOnHerRecord()
    {
        await OnTuesdayEveningAsync("lena", _ => { }, (_, mine) => Assert.Empty(mine));
    }

    private static IReadOnlyList<StartMineDto> MineOf(GetStartResponse start) =>
        start.Panels.SingleOrDefault(panel => panel.Kind == StartPanelKind.Mine)?.Mine ?? [];

    private Task OnTuesdayEveningAsync(
        string viewerAlias,
        Action<SeedContextBuilder> arrange,
        Action<SeededContext, IReadOnlyList<StartMineDto>> assert
    ) => AtAsync(TuesdayEvening, viewerAlias, arrange, assert);

    private async Task AtAsync(
        DateTimeOffset instant,
        string viewerAlias,
        Action<SeedContextBuilder> arrange,
        Action<SeededContext, IReadOnlyList<StartMineDto>> assert
    )
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            instant,
            async () =>
            {
                var ctx = await _fixture.BuildAsync(
                    builder =>
                    {
                        builder.Identity(identity =>
                            identity
                                .AddPerson("lena", "Lena", "Garde")
                                .AddAccount("lena")
                                .AddMembership("lena-member", "lena", JoinedIn2015)
                        );
                        arrange(builder);
                    },
                    ct
                );
                var client = await ctx.Identity.ClientForAsync(viewerAlias, ct);

                var (response, start) = await client.GETAsync<GetStart, GetStartResponse>();

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.True(start.ViewerIsActiveInClub);
                assert(ctx, MineOf(start));
            }
        );
    }
}
