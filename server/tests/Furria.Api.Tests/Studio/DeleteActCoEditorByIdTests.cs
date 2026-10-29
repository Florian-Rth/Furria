using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class DeleteActCoEditorByIdTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteActCoEditorByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_TakeBackTheStudio_When_TheGroupAdminRevokesTheCoEditor()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var anna = ctx.Identity.People.IdOf(Anna);
        await GrantCoEditorAsync(admin, actId, anna);

        var response = await admin.DELETEAsync<DeleteActCoEditorById, DeleteActCoEditorByIdRequest>(
            new() { ActId = actId, PersonId = anna }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var studio = await StudioOfAsync(await ctx.Identity.ClientForAsync(Anna, ct), actId);
        Assert.False(studio.Viewer.CanEditStudio);
        Assert.Empty(studio.CoEditors);
    }

    [Fact]
    public async Task Should_ReportNotFound_When_ThePersonIsNoCoEditor()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);

        var response = await admin.DELETEAsync<DeleteActCoEditorById, DeleteActCoEditorByIdRequest>(
            new() { ActId = actId, PersonId = ctx.Identity.People.IdOf(Anna) }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
