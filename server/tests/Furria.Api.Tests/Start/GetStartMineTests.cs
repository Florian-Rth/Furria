using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Start;
using Furria.Application.Authorization;
using Furria.Application.Start;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Start;

public sealed class GetStartMineTests : IClassFixture<ApiTestFixture>
{
    private const int PausedSessionYear = 2026;

    private static readonly DateOnly JoinedIn2015 = new(2015, 11, 11);
    private static readonly DateOnly Today = new(2027, 1, 19);
    private static readonly DateOnly ThirteenDaysAgo = new(2027, 1, 6);
    private static readonly DateOnly LastWeek = new(2027, 1, 12);
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
    public async Task Should_AnnounceNothing_When_SheGotARoleWithinTwoWeeks()
    {
        await OnTuesdayEveningAsync(
            "lena",
            builder =>
                builder.Roles(roles =>
                    roles
                        .AddRole("aushang", "Aushang", FurriaPermissions.AnnouncementsPost)
                        .AddRoleHolding("lena-aushang", "aushang", "lena", ThirteenDaysAgo)
                ),
            (_, mine) => Assert.Empty(mine)
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

    private static IReadOnlyList<StartMineDto> MineOf(GetStartResponse start) =>
        start.Panels.SingleOrDefault(panel => panel.Kind == StartPanelKind.Mine)?.Mine ?? [];

    private Task OnTuesdayEveningAsync(
        string viewerAlias,
        Action<SeedContextBuilder> arrange,
        Action<SeededContext, IReadOnlyList<StartMineDto>> assert
    ) => AtAsync(TuesdayEvening, viewerAlias, arrange, assert);

    private Task AtAsync(
        DateTimeOffset instant,
        string viewerAlias,
        Action<SeedContextBuilder> arrange,
        Action<SeededContext, IReadOnlyList<StartMineDto>> assert
    ) => AtAsync(instant, viewerAlias, arrange, (_, _) => Task.CompletedTask, assert);

    private async Task AtAsync(
        DateTimeOffset instant,
        string viewerAlias,
        Action<SeedContextBuilder> arrange,
        Func<SeededContext, CancellationToken, Task> alter,
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
                await alter(ctx, ct);
                var client = await ctx.Identity.ClientForAsync(viewerAlias, ct);

                var (response, start) = await client.GETAsync<GetStart, GetStartResponse>();

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.True(start.ViewerIsActiveInClub);
                assert(ctx, MineOf(start));
            }
        );
    }
}
