using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Api.Tests.Media;
using Furria.Core.Media;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

public sealed class DeleteGroupPictureTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteGroupPictureTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_TakeThePictureAndItsFilesAway_When_TheGroupAdminRemovesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("gerda"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("gerda-tanzgarde", "tanzgarde", "gerda")
                    ),
            ct
        );
        var groupId = ctx.Groups.Groups.IdOf("tanzgarde");
        var client = await ctx.Identity.ClientForAsync("gerda", ct);
        var pictureId = await PictureSteps.RenderedGroupPictureAsync(_fixture, client, groupId, ct);
        var original = await _fixture.MediaFileOfAsync(pictureId, MediaRendition.Original, ct);

        var response = await client.DELETEAsync<DeleteGroupPicture, DeleteGroupPictureRequest>(
            new() { GroupId = groupId }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx.Expected.MediaItem(pictureId).ToBeGone().AssertAsync(ct);
        Assert.False(File.Exists(original));
    }
}
