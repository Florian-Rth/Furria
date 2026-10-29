using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Core.RunningOrders;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class GetActStudioTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetActStudioTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_OpenTheStudioReadOnly_When_ACastMemberOpensTheAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var anna = await ctx.Identity.ClientForAsync(Anna, ct);

        var studio = await StudioOfAsync(anna, actId);

        Assert.Equal("Gardetanz", studio.Act.Name);
        Assert.Equal(
            (true, false, false, false),
            (
                studio.Viewer.InCast,
                studio.Viewer.CanEditSettings,
                studio.Viewer.CanEditStudio,
                studio.Viewer.CanGrantCoEditors
            )
        );
        Assert.NotNull(studio.Studio);
        Assert.Equal(0, studio.Studio.Music.LengthSeconds);
        Assert.Empty(studio.Studio.Songs);
    }

    [Fact]
    public async Task Should_ShowTheActWithoutTheStudio_When_APlannerOpensIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);

        var studio = await StudioOfAsync(planner, actId);

        Assert.Equal(
            (false, true, false, false),
            (
                studio.Viewer.InCast,
                studio.Viewer.CanEditSettings,
                studio.Viewer.CanEditStudio,
                studio.Viewer.CanGrantCoEditors
            )
        );
        Assert.Null(studio.Studio);
        Assert.Empty(studio.CoEditors);
    }

    [Fact]
    public async Task Should_LetTheGroupAdminEditEverything_When_TheyOpenTheirGroupsAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);

        var studio = await StudioOfAsync(admin, actId);

        Assert.Equal(
            (false, true, true, true),
            (
                studio.Viewer.InCast,
                studio.Viewer.CanEditSettings,
                studio.Viewer.CanEditStudio,
                studio.Viewer.CanGrantCoEditors
            )
        );
        Assert.NotNull(studio.Studio);
    }

    [Fact]
    public async Task Should_ShowTheActWithoutTheStudio_When_AGroupMemberIsNotInTheCast()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct, removed: [ctx.Identity.People.IdOf(Ben)]);
        var ben = await ctx.Identity.ClientForAsync(Ben, ct);

        var studio = await StudioOfAsync(ben, actId);

        Assert.False(studio.Viewer.InCast);
        Assert.Null(studio.Studio);
    }

    [Fact]
    public async Task Should_LetACoEditorEditTheStudio_When_TheGroupAdminGrantedIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        await GrantCoEditorAsync(admin, actId, ctx.Identity.People.IdOf(Anna));
        var anna = await ctx.Identity.ClientForAsync(Anna, ct);

        var studio = await StudioOfAsync(anna, actId);

        Assert.Equal(
            (true, false, true, false),
            (
                studio.Viewer.InCast,
                studio.Viewer.CanEditSettings,
                studio.Viewer.CanEditStudio,
                studio.Viewer.CanGrantCoEditors
            )
        );
        Assert.Equal(["Anna"], studio.CoEditors.Select(person => person.FirstName));
    }

    [Fact]
    public async Task Should_Forbid_When_TheViewerHasNoTieToTheAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var clara = await ctx.Identity.ClientForAsync(Clara, ct);

        var (response, _) = await clara.GETAsync<
            GetActStudio,
            GetActStudioRequest,
            GetActStudioResponse
        >(new() { ActId = actId });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ShowTheStudio_When_AGuestIsAddedToTheCast()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct, added: [ctx.Identity.People.IdOf(Clara)]);
        var clara = await ctx.Identity.ClientForAsync(Clara, ct);

        var studio = await StudioOfAsync(clara, actId);

        Assert.True(studio.Viewer.InCast);
        Assert.NotNull(studio.Studio);
    }

    [Fact]
    public async Task Should_OfferOnlyTheSettingsToRestoreIt_When_TheActIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        await admin.PUTAsync<PutActArchived, PutActArchivedRequest>(
            new() { ActId = actId, Archived = true }
        );

        var studio = await StudioOfAsync(admin, actId);

        Assert.Equal(
            (true, false, false),
            (
                studio.Viewer.CanEditSettings,
                studio.Viewer.CanEditStudio,
                studio.Viewer.CanGrantCoEditors
            )
        );
        Assert.NotNull(studio.Studio);
    }

    [Fact]
    public async Task Should_TakeTheStudioFromACoEditor_When_SheLeavesTheCast()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var annaId = ctx.Identity.People.IdOf(Anna);
        await GrantCoEditorAsync(admin, actId, annaId);
        await admin.PUTAsync<PutAct, PutActRequest>(
            new()
            {
                ActId = actId,
                Name = "Gardetanz",
                GroupId = ctx.Groups.Groups.IdOf(Garde),
                Kind = ActKind.Dance,
                SessionYear = null,
                AddedPersonIds = [],
                RemovedPersonIds = [annaId],
                Wishes = [],
            }
        );
        var anna = await ctx.Identity.ClientForAsync(Anna, ct);

        var studio = await StudioOfAsync(anna, actId);

        Assert.False(studio.Viewer.CanEditStudio);
        Assert.Null(studio.Studio);
    }
}
