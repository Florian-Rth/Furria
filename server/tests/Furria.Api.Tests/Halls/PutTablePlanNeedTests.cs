using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Halls;
using Furria.Api.Endpoints.Seating;
using Furria.Api.Endpoints.TablePlans;
using Furria.Core.Events;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Halls.HallSeeds;
using static Furria.Api.Tests.Halls.HallSteps;

namespace Furria.Api.Tests.Halls;

[SeedsAliases]
public sealed class PutTablePlanNeedTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutTablePlanNeedTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_DropTheHallStep_When_NoTablePlanIsNeeded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SaalchefWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Saalchef, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);

        var response = await client.PUTAsync<PutTablePlanNeed, PutTablePlanNeedRequest>(
            new() { EventId = eventId, Needed = false }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var lead = await ctx.Identity.ClientForAsync(EventLead, ct);
        var listed = await EventOfAsync(lead, eventId);
        Assert.True(listed.WithoutTablePlan);
        Assert.DoesNotContain(listed.Steps, step => step.Step == EventStep.Hall);
    }

    [Fact]
    public async Task Should_BringTheHallStepBack_When_APlanIsNeededAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SaalchefWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Saalchef, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        await client.PUTAsync<PutTablePlanNeed, PutTablePlanNeedRequest>(
            new() { EventId = eventId, Needed = false }
        );

        await client.PUTAsync<PutTablePlanNeed, PutTablePlanNeedRequest>(
            new() { EventId = eventId, Needed = true }
        );

        var lead = await ctx.Identity.ClientForAsync(EventLead, ct);
        var listed = await EventOfAsync(lead, eventId);
        Assert.False(listed.WithoutTablePlan);
        Assert.Contains(listed.Steps, step => step.Step == EventStep.Hall);
    }
}
