using System.Net;
using Furria.Api.Tests.RunningOrders;
using Furria.Application.Authorization;
using Furria.Core.Media;
using Furria.Core.RunningOrders;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Media;

public sealed class MediaUploadTests : IClassFixture<ApiTestFixture>
{
    private const int ChunkLength = 4096;

    private readonly ApiTestFixture _fixture;

    public MediaUploadTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_KeepTheOriginalAndQueueItsRenditions_When_AnUploaderFinishesAPhotoForTheGallery()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("ilka"))
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "galerie",
                            "ilka-galerie",
                            "Galerie",
                            "ilka",
                            FurriaPermissions.GalleryUpload
                        )
                    ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var photo = MediaSamples.Jpeg(3 * ChunkLength + 17);

        var mediaItemId = await TusUploadSteps.UploadAsync(
            client,
            TusUploadSteps.GalleryOwner,
            "Prunksitzung 042.jpg",
            photo,
            ChunkLength,
            ct
        );

        await ctx
            .Expected.MediaItem(mediaItemId)
            .ToAwaitItsRenditions(MediaKind.Photo, "image/jpeg")
            .MediaItem(mediaItemId)
            .ToBeOwnedBy(MediaOwner.Gallery)
            .MediaItem(mediaItemId)
            .ToBeUploadedAs(ctx.Identity.People.IdOf("ilka"), "Prunksitzung 042.jpg", photo.Length)
            .AssertAsync(ct);
        Assert.Equal(
            photo,
            await File.ReadAllBytesAsync(
                await _fixture.MediaFileOfAsync(mediaItemId, MediaRendition.Original, ct),
                ct
            )
        );
    }

    [Fact]
    public async Task Should_DropTheFormerPortraitWithItsFiles_When_SheUploadsANewOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var aliceId = ctx.Identity.People.IdOf("alice");
        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var formerId = await PictureSteps.RenderedPortraitAsync(_fixture, client, aliceId, ct);
        var formerOriginal = await _fixture.MediaFileOfAsync(formerId, MediaRendition.Original, ct);

        var portraitId = await PictureSteps.UploadedPortraitAsync(client, aliceId, ct);

        await ctx
            .Expected.MediaItem(portraitId)
            .ToBeThePortraitOf(aliceId)
            .MediaItem(formerId)
            .ToBeGone()
            .AssertAsync(ct);
        await _fixture.MediaFilesReapedAsync(ct);
        Assert.False(File.Exists(formerOriginal));
    }

    [Fact]
    public async Task Should_RefuseThePortrait_When_ItIsAnotherPersonsAndTheCallerMayNotManagePersons()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity => identity.AddAccount("alice").AddPerson("bernd")),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("alice", ct);

        var response = await TusUploadSteps.CreateAsync(
            client,
            TusUploadSteps.PersonOwner(ctx.Identity.People.IdOf("bernd")),
            "bernd.jpg",
            ChunkLength,
            ct
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheGroupPicture_When_TheGroupIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("gerda"))
                    .Groups(groups =>
                        groups
                            .AddGroup(
                                "tanzgarde",
                                "Tanzgarde",
                                archivedOn: new DateOnly(2020, 1, 1)
                            )
                            .AddGroupAdmin("gerda-tanzgarde", "tanzgarde", "gerda")
                    ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("gerda", ct);

        var response = await TusUploadSteps.CreateAsync(
            client,
            TusUploadSteps.GroupOwner(ctx.Groups.Groups.IdOf("tanzgarde")),
            "garde.jpg",
            ChunkLength,
            ct
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheGroupPicture_When_TheCallerDoesNotAdministerTheGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("bernd"))
                    .Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("bernd", ct);

        var response = await TusUploadSteps.CreateAsync(
            client,
            TusUploadSteps.GroupOwner(ctx.Groups.Groups.IdOf("tanzgarde")),
            "garde.jpg",
            ChunkLength,
            ct
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_RejectTheFirstChunk_When_TheContentIsNoAcceptedMedia()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var animation = MediaSamples.Gif(ChunkLength);
        var upload = await TusUploadSteps.CreatedAsync(
            client,
            TusUploadSteps.PersonOwner(ctx.Identity.People.IdOf("alice")),
            "ich.jpg",
            animation.Length,
            ct
        );

        var response = await TusUploadSteps.PatchAsync(client, upload, 0, animation, ct);

        Assert.Equal(HttpStatusCode.UnsupportedMediaType, response.StatusCode);
        await ctx.Expected.MediaItems().ToHaveCount(0).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_HideTheUpload_When_AnotherAccountTriesToResumeIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity => identity.AddAccount("alice").AddAccount("bernd")),
            ct
        );
        var alice = await ctx.Identity.ClientForAsync("alice", ct);
        var bernd = await ctx.Identity.ClientForAsync("bernd", ct);
        var upload = await TusUploadSteps.CreatedAsync(
            alice,
            TusUploadSteps.PersonOwner(ctx.Identity.People.IdOf("alice")),
            "ich.jpg",
            ChunkLength,
            ct
        );

        var response = await TusUploadSteps.HeadAsync(bernd, upload, ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseActMedia_When_TheCallerDoesNotAdministerTheActsGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, actId) = await GardeWithDanceAsync(ct);
        var client = await ctx.Identity.ClientForAsync("bernd", ct);

        var response = await TusUploadSteps.CreateAsync(
            client,
            TusUploadSteps.ActOwner(actId),
            "Gardemarsch.wav",
            ChunkLength,
            ct
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseActMedia_When_TheActsSessionIsOver()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, actId) = await GardeWithDanceAsync(ct);
        HttpResponseMessage? response = null;

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromDays(400),
            async () =>
                response = await TusUploadSteps.CreateAsync(
                    await ctx.Identity.SignInAgainAsync("gerda", ct),
                    TusUploadSteps.ActOwner(actId),
                    "Gardemarsch.wav",
                    ChunkLength,
                    ct
                )
        );

        Assert.Equal(HttpStatusCode.Conflict, response?.StatusCode);
    }

    private async Task<(SeededContext Context, int ActId)> GardeWithDanceAsync(CancellationToken ct)
    {
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("gerda").AddAccount("bernd"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup("elferrat", "Elferrat")
                            .AddGroupAdmin("gerda-tanzgarde", "tanzgarde", "gerda")
                            .AddGroupAdmin("bernd-elferrat", "elferrat", "bernd")
                    ),
            ct
        );
        var actId = await RunningOrderSteps.CreateActAsync(
            await ctx.Identity.ClientForAsync("gerda", ct),
            "Gardetanz",
            ctx.Groups.Groups.IdOf("tanzgarde"),
            ActKind.Dance
        );
        return (ctx, actId);
    }
}
