using System.Text.Json.Nodes;
using Furria.Api.Tests.Halls;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Core.RunningOrders;
using Furria.Infrastructure.Assistant;
using Furria.Tests.Common.Assistant;
using Furria.Tests.Common.Builder;
using Xunit;
using static Furria.Api.Tests.Assistant.ClubAssistantSteps;
using static Furria.Api.Tests.Halls.HallSteps;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;

namespace Furria.Api.Tests.Assistant;

public sealed partial class ClubAssistantToolTests
{
    private const string SvensChatId = "491705550123@c.us";

    private static readonly string[] ManagementTools =
    [
        ClubAssistantTools.EventPreparation,
        ClubAssistantTools.RunningOrderPlanning,
        ClubAssistantTools.TablePlans,
        ClubAssistantTools.MyToDos,
    ];

    [Fact]
    public async Task Should_OfferNoManagementTool_When_TheAskerHoldsNoPermission()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(_ => { }, ct);

        var offered = await OfferedToolsAsync(ctx, AlicesChatId, ct);

        Assert.Contains(ClubAssistantTools.CalendarEntries, offered);
        Assert.All(ManagementTools, tool => Assert.DoesNotContain(tool, offered));
    }

    [Fact]
    public async Task Should_OfferOnlyRunningOrderPlanning_When_TheAskerPlansRunningOrders()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PaulaOnWhatsApp(), ct);

        var offered = await OfferedToolsAsync(ctx, PaulasChatId, ct);

        Assert.Contains(ClubAssistantTools.RunningOrderPlanning, offered);
        Assert.DoesNotContain(ClubAssistantTools.EventPreparation, offered);
        Assert.DoesNotContain(ClubAssistantTools.TablePlans, offered);
        Assert.DoesNotContain(ClubAssistantTools.MyToDos, offered);
    }

    [Fact]
    public async Task Should_CountActsAndFindingsWithoutNames_When_APlannerAsksAboutPlanning()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PaulaOnWhatsApp(), ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var garde = ctx.Groups.Groups.IdOf(Garde);
        var tanz = await CreateActAsync(planner, "Gardetanz", garde, ActKind.Dance);
        var rede = await CreateActAsync(planner, "Büttenrede", kind: ActKind.Speech);
        await SavedAsync(planner, eventId, null, [Line(tanz, 0), Line(rede, null)]);

        var planning = await ToolResultAsync(
            ctx,
            ClubAssistantTools.RunningOrderPlanning,
            new { },
            ct,
            PaulasChatId
        );

        Assert.Contains("\"hasRunningOrder\":true", planning);
        Assert.Contains("\"placedActs\":1", planning);
        Assert.Contains("\"unplacedActs\":1", planning);
        Assert.Contains("\"isConfirmed\":false", planning);
        Assert.Contains("/running-order", planning);
        Assert.DoesNotContain("Anna", planning);
        Assert.DoesNotContain("Ben", planning);
    }

    [Fact]
    public async Task Should_NameStepsAndCurrentStep_When_AnEventManagerAsksAboutPreparation()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                AliceInTheGarde(builder)
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "veranstaltungen",
                            "alice-veranstaltungen",
                            "Veranstaltungen",
                            "alice",
                            FurriaPermissions.EventsManage
                        )
                    )
                    .Club(club =>
                        club.AddVenue(ClubRoom, "Vereinsraum")
                            .AddEvent(
                                "secret",
                                "Geheimer Ball",
                                ClubClock.At(Tomorrow.AddDays(120), new TimeOnly(20, 0)),
                                ClubRoom,
                                unpublished: true
                            )
                    ),
            ct
        );

        var preparation = await ToolResultAsync(
            ctx,
            ClubAssistantTools.EventPreparation,
            new { },
            ct
        );

        Assert.Contains("Geheimer Ball", preparation);
        Assert.Contains("\"isPublished\":false", preparation);
        Assert.Contains("\"currentStep\":\"Eckdaten\"", preparation);
        Assert.Contains("Saal & Tische", preparation);
    }

    [Fact]
    public async Task Should_GiveTablesAndChairs_When_AHallPlannerAsksAboutTablePlans()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
            {
                HallSeeds.HallManagerWithGala(ClubClock.DayOf(Now))(builder);
                builder.Identity(identity =>
                    identity.AddPersonContact(HallSeeds.HallManager, phone: "0170 5550123")
                );
            },
            ct
        );
        var hallManager = await ctx.Identity.ClientForAsync(HallSeeds.HallManager, ct);
        var eventId = ctx.Club.Events.IdOf(HallSeeds.Gala);
        var hallId = await CreateHallAsync(
            hallManager,
            ctx.Club.Venues.IdOf(HallSeeds.Buergerhaus),
            "Großer Saal"
        );
        await CreatePlanAsync(hallManager, eventId, hallId);
        await SavedPlanAsync(
            hallManager,
            eventId,
            hallId,
            1,
            [Row("r1", HallSeeds.BeerTableId, 3)],
            24
        );

        var plans = await ToolResultAsync(
            ctx,
            ClubAssistantTools.TablePlans,
            new { },
            ct,
            SvensChatId
        );

        var rows = JsonNode.Parse(plans)!.AsArray();
        var gala = rows.Single(row => row!["eventId"]!.GetValue<int>() == eventId)!;
        var kinderGala = rows.Single(row =>
            row!["eventId"]!.GetValue<int>() == ctx.Club.Events.IdOf(HallSeeds.KinderGala)
        )!;
        Assert.True(gala["hasTablePlan"]!.GetValue<bool>());
        Assert.Equal("Großer Saal", gala["hall"]!.GetValue<string>());
        Assert.Equal(3, gala["tables"]!.GetValue<int>());
        Assert.Equal(24, gala["chairs"]!.GetValue<int>());
        Assert.False(kinderGala["hasTablePlan"]!.GetValue<bool>());
        Assert.True(kinderGala["needsTablePlan"]!.GetValue<bool>());
        Assert.DoesNotContain(ClubAssistantTools.EventPreparation, _fixture.Model.OfferedTools());
    }

    [Fact]
    public async Task Should_CountToDosWithoutNames_When_AGroupAdminAndApplicationDeciderAsks()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                AliceInTheGarde(builder)
                    .Identity(identity =>
                        identity.AddMembershipApplication(
                            "applicant",
                            new DateOnly(2000, 5, 1),
                            "Clara",
                            "Neumann"
                        )
                    )
                    .Groups(groups => groups.AddGroupAdmin("alice-admin", "garde", "alice"))
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "aufnahme",
                            "alice-aufnahme",
                            "Aufnahme",
                            "alice",
                            FurriaPermissions.MembershipApplicationsDecide
                        )
                    )
                    .GroupMatcher(matcher =>
                        matcher
                            .AddStatement("loud", "Wir sind laut.")
                            .AddStatement("early", "Wir proben früh.")
                    ),
            ct
        );

        var toDos = await ToolResultAsync(ctx, ClubAssistantTools.MyToDos, new { }, ct);

        Assert.Contains("Beitrittsantrag offen", toDos);
        Assert.Contains("\"count\":2", toDos);
        Assert.Contains("Garde", toDos);
        Assert.Contains("/manage/applications", toDos);
        Assert.DoesNotContain("Clara", toDos);
    }

    private async Task<IReadOnlyList<string>> OfferedToolsAsync(
        SeededContext ctx,
        string chatId,
        CancellationToken ct
    )
    {
        await SwitchOnAsync(ctx, ct);
        _fixture.Model.Script(FakeModelReply.Saying("Alaaf."));

        await AskAsync(_fixture, chatId, "Was gibt's?", ct);

        return _fixture.Model.OfferedTools();
    }
}
