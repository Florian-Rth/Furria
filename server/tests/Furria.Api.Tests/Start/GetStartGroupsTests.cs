using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Start;
using Furria.Application.Start;
using Furria.Core.Groups;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Start;

public sealed class GetStartGroupsTests : IClassFixture<ApiTestFixture>
{
    private const int TanzgardeFounded = 2001;
    private const int KindergardeFounded = 2016;
    private const int MaennerballettFounded = 2006;
    private const int AltgardeFounded = 1996;

    private static readonly DateOnly JoinedIn2015 = new(2015, 11, 11);
    private static readonly DateOnly ArchivedLastSummer = new(2026, 6, 30);
    private static readonly DateOnly LastDayOfTheOpeningFortnight = new(2026, 11, 24);

    private static readonly DateTimeOffset MondayMorningOfLaunchWeek = new(
        2026,
        11,
        16,
        7,
        15,
        0,
        TimeSpan.Zero
    );

    private static readonly DateTimeOffset MorningAfterTheOpeningFortnight = new(
        2026,
        11,
        25,
        7,
        15,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public GetStartGroupsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_MarkTheJubilee_When_TheSessionOpenedWithinTwoWeeksOfAFifthYear()
    {
        await AtAsync(
            MondayMorningOfLaunchWeek,
            "lena",
            (ctx, start) =>
            {
                var jubilee = Assert.Single(GroupMomentsOf(start));

                Assert.Equal(StartGroupMomentKind.Jubilee, jubilee.Kind);
                Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), jubilee.GroupId);
                Assert.Equal("Tanzgarde", jubilee.Name);
                Assert.Equal(GroupTone.Rose, jubilee.Tone);
                Assert.Equal(25, jubilee.Years);
                Assert.Equal(TanzgardeFounded, jubilee.FoundedYear);
                Assert.Equal(LastDayOfTheOpeningFortnight, jubilee.Until);
            }
        );
    }

    [Fact]
    public async Task Should_MarkTheJubilee_When_SheOnlyAdministersTheGroup()
    {
        await AtAsync(
            MondayMorningOfLaunchWeek,
            "sabine",
            (ctx, start) =>
            {
                var jubilee = Assert.Single(GroupMomentsOf(start));

                Assert.Equal(ctx.Groups.Groups.IdOf("kindergarde"), jubilee.GroupId);
                Assert.Equal(10, jubilee.Years);
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutTheJubilee_When_TheGroupIsArchived()
    {
        await AtAsync(
            MondayMorningOfLaunchWeek,
            "lena",
            (ctx, start) =>
                Assert.DoesNotContain(
                    GroupMomentsOf(start),
                    moment => moment.GroupId == ctx.Groups.Groups.IdOf("altgarde")
                )
        );
    }

    [Fact]
    public async Task Should_LeaveOutAnotherGroupsJubilee_When_SheIsNotInTheGroup()
    {
        await AtAsync(
            MondayMorningOfLaunchWeek,
            "lena",
            (ctx, start) =>
                Assert.DoesNotContain(
                    GroupMomentsOf(start),
                    moment => moment.GroupId == ctx.Groups.Groups.IdOf("maennerballett")
                )
        );
    }

    [Fact]
    public async Task Should_LeaveOutGroups_When_NoMomentIsDue()
    {
        await AtAsync(
            MorningAfterTheOpeningFortnight,
            "lena",
            (_, start) =>
                Assert.DoesNotContain(start.Panels, panel => panel.Kind == StartPanelKind.Groups)
        );
    }

    private static IReadOnlyList<StartGroupMomentDto> GroupMomentsOf(GetStartResponse start) =>
        start.Panels.SingleOrDefault(panel => panel.Kind == StartPanelKind.Groups)?.GroupMoments
        ?? [];

    private async Task AtAsync(
        DateTimeOffset instant,
        string viewerAlias,
        Action<SeededContext, GetStartResponse> assert
    )
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            instant,
            async () =>
            {
                var ctx = await SeedAsync(ct);
                var client = await ctx.Identity.ClientForAsync(viewerAlias, ct);

                var (response, start) = await client.GETAsync<GetStart, GetStartResponse>();

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                assert(ctx, start);
            }
        );
    }

    private Task<SeededContext> SeedAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("lena", "Lena", "Garde")
                            .AddAccount("lena")
                            .AddMembership("lena-member", "lena", JoinedIn2015)
                            .AddPerson("sabine", "Sabine", "Trainerin")
                            .AddAccount("sabine")
                            .AddPerson("kevin", "Kevin", "Ballett")
                            .AddAccount("kevin")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup(
                                "tanzgarde",
                                "Tanzgarde",
                                foundedYear: TanzgardeFounded,
                                tone: GroupTone.Rose
                            )
                            .AddGroup("kindergarde", "Kindergarde", foundedYear: KindergardeFounded)
                            .AddGroup(
                                "maennerballett",
                                "Männerballett",
                                foundedYear: MaennerballettFounded
                            )
                            .AddGroup(
                                "altgarde",
                                "Altgarde",
                                archivedOn: ArchivedLastSummer,
                                foundedYear: AltgardeFounded
                            )
                            .AddGroupMembership("lena-tanzgarde", "tanzgarde", "lena")
                            .AddGroupMembership("lena-altgarde", "altgarde", "lena")
                            .AddGroupAdmin(
                                "sabine-kindergarde",
                                "kindergarde",
                                "sabine",
                                "Trainerin",
                                JoinedIn2015
                            )
                            .AddGroupMembership("kevin-ballett", "maennerballett", "kevin")
                    ),
            ct
        );
}
