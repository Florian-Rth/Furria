using FastEndpoints;
using Furria.Api.Endpoints.RunningOrders;
using Furria.Core.RunningOrders;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;

namespace Furria.Api.Tests.RunningOrders;

[SeedsAliases]
public sealed class AppearanceMigrationTests : IClassFixture<ApiTestFixture>
{
    private const string BeforeAppearances = "20261029141812_ActAudioMedia";

    private readonly ApiTestFixture _fixture;

    public AppearanceMigrationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CarryEveryLineIntoAnAppearance_When_TheRunningOrderLinesAreMigrated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var anna = ctx.Identity.People.IdOf(Anna);
        var ben = ctx.Identity.People.IdOf(Ben);
        var gala = ctx.Club.Events.IdOf(Gala);
        var einmarsch = await CreateActAsync(client, "Einmarsch", added: [anna]);
        var marsch = await CreateActAsync(client, "Marsch", added: [anna, ben]);
        var polka = await CreateActAsync(client, "Polka", added: [ben]);
        var rede = await CreateActAsync(client, "Büttenrede");
        var saved = await SavedAsync(
            client,
            gala,
            null,
            [
                Line(einmarsch, 0, pinned: true),
                Line(marsch, 1, blockKey: 3),
                Line(polka, 2, blockKey: 3),
                Line(rede, null),
            ],
            [Rule(RunningOrderRuleKind.Before, marsch, rede)]
        );

        await _fixture.MigrateDatabaseToAsync(BeforeAppearances, ct);
        await _fixture.RunDatabaseMigratorAsync(ct);

        var migrated = await RunningOrderOfAsync(client, gala);
        Assert.Equal(saved.Version, migrated.Version);
        Assert.Equal(LinesOf(saved.Lines), LinesOf(migrated.Lines));
        Assert.Equal(
            saved.Rules.Select(rule => (rule.Kind, rule.ActId, rule.OtherActId)),
            migrated.Rules.Select(rule => (rule.Kind, rule.ActId, rule.OtherActId))
        );
        var added = await CreateActAsync(client, "Finale");
        var grown = await SavedAsync(
            client,
            gala,
            migrated.Version,
            [
                Line(einmarsch, 0, pinned: true),
                Line(marsch, 1, blockKey: 3),
                Line(polka, 2, blockKey: 3),
                Line(rede, null),
                Line(added, 3),
            ]
        );
        Assert.True(
            grown.Lines.Single(line => line.Act.ActId == added).LineId
                > migrated.Lines.Max(line => line.LineId)
        );
    }

    private static IReadOnlyList<string> LinesOf(IReadOnlyList<RunningOrderLineDto> lines) =>
        [
            .. lines
                .OrderBy(line => line.LineId)
                .Select(line =>
                    $"{line.LineId}:{line.Act.ActId}@{line.Position}"
                    + $" pin={line.Pinned} block={line.BlockKey}"
                    + $" cast={string.Join(',', line.Act.Cast.Select(person => person.PersonId).Order())}"
                ),
        ];

    private static async Task<GetRunningOrderResponse> RunningOrderOfAsync(
        HttpClient client,
        int eventId
    )
    {
        var (response, result) = await client.GETAsync<
            GetRunningOrder,
            GetRunningOrderRequest,
            GetRunningOrderResponse
        >(new() { EventId = eventId });
        response.EnsureSuccessStatusCode();

        return result;
    }
}
