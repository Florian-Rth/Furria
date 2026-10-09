using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Api.Tests.Media;
using Furria.Core.Media;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

public sealed class PutGroupPictureCropTests : IClassFixture<ApiTestFixture>
{
    private static readonly PictureCrop NewCut = new(0, 0.25, 1, 0.5);

    private readonly ApiTestFixture _fixture;

    public PutGroupPictureCropTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RenderThePictureAnewInTheNewCut_When_TheGroupAdminRecropsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await GardeWithItsAdminAndAMemberAsync(ct);
        var groupId = ctx.Groups.Groups.IdOf("tanzgarde");
        var client = await ctx.Identity.ClientForAsync("gerda", ct);
        var pictureId = await PictureSteps.RenderedGroupPictureAsync(_fixture, client, groupId, ct);

        var response = await client.PUTAsync<PutGroupPictureCrop, PutGroupPictureCropRequest>(
            RecropOf(groupId)
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.MediaItem(pictureId)
            .ToBeCroppedTo(NewCut)
            .MediaItem(pictureId)
            .ToAwaitItsRenditions(MediaKind.Photo, "image/jpeg")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheRecrop_When_TheCallerOnlyBelongsToTheGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await GardeWithItsAdminAndAMemberAsync(ct);
        var groupId = ctx.Groups.Groups.IdOf("tanzgarde");
        var pictureId = await PictureSteps.RenderedGroupPictureAsync(
            _fixture,
            await ctx.Identity.ClientForAsync("gerda", ct),
            groupId,
            ct
        );
        var client = await ctx.Identity.ClientForAsync("tanja", ct);

        var response = await client.PUTAsync<PutGroupPictureCrop, PutGroupPictureCropRequest>(
            RecropOf(groupId)
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx.Expected.MediaItem(pictureId).ToBeIn(MediaItemState.Ready).AssertAsync(ct);
    }

    private Task<SeededContext> GardeWithItsAdminAndAMemberAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("gerda").AddAccount("tanja"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("gerda-tanzgarde", "tanzgarde", "gerda")
                            .AddGroupMembership(
                                "tanja-tanzgarde",
                                "tanzgarde",
                                "tanja",
                                new DateOnly(2020, 1, 1)
                            )
                    ),
            ct
        );

    private static PutGroupPictureCropRequest RecropOf(int groupId) =>
        new()
        {
            GroupId = groupId,
            Left = NewCut.Left,
            Top = NewCut.Top,
            Width = NewCut.Width,
            Height = NewCut.Height,
        };
}
