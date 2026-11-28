using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Core.RunningOrders;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
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
    public async Task Should_EndTheCoEditing_When_TheCoEditorLeavesTheGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        SeededContext? ctx = null;
        var actId = 0;
        await _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
                actId = await GardetanzAsync(ctx, ct);
                var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
                await GrantCoEditorAsync(admin, actId, ctx.Identity.People.IdOf(Ben));
            }
        );

        await _fixture.AtInstantAsync(
            InTheRunningSession.AddDays(GalaInDays),
            async () =>
            {
                var seeded = ctx!;
                var admin = await seeded.Identity.SignInAgainAsync(GardeAdmin, ct);
                var ben = await seeded.Identity.SignInAgainAsync(Ben, ct);

                var studio = await StudioOfAsync(admin, actId);
                var (response, _) = await ben.GETAsync<
                    GetActStudio,
                    GetActStudioRequest,
                    GetActStudioResponse
                >(new() { ActId = actId });

                Assert.Empty(studio.CoEditors);
                Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            }
        );
    }

    [Fact]
    public async Task Should_ShowTheSpotOpen_When_ItsHolderLeftTheGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        SeededContext? ctx = null;
        var actId = 0;
        var spotId = 0;
        await _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
                actId = await GardetanzAsync(ctx, ct);
                var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
                spotId = await AddSpotAsync(admin, actId);
                var assigned = await AssignSpotAsync(
                    admin,
                    actId,
                    spotId,
                    ctx.Identity.People.IdOf(Ben)
                );
                assigned.EnsureSuccessStatusCode();
            }
        );

        await _fixture.AtInstantAsync(
            InTheRunningSession.AddDays(GalaInDays),
            async () =>
            {
                var admin = await ctx!.Identity.SignInAgainAsync(GardeAdmin, ct);

                var studio = await StudioOfAsync(admin, actId);

                var spot = Assert.Single(studio.Studio!.Spots);
                Assert.Equal((spotId, (int?)null), (spot.SpotId, spot.Person?.PersonId));
            }
        );
    }
}
