using System.Net;
using Furria.Application.Authorization;
using Furria.Core.Media;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Media;

public sealed class MediaUploadTests : IClassFixture<ApiTestFixture>
{
    private const int ChunkLength = 4096;
    private const long BeyondThePhotoLimit = MediaLimits.MaxPhotoBytes + 1;

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
    public async Task Should_AcceptAVideo_When_ItIsUploadedToTheGallery()
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

        var mediaItemId = await TusUploadSteps.UploadAsync(
            client,
            TusUploadSteps.GalleryOwner,
            "Einmarsch.mp4",
            MediaSamples.Mp4(ChunkLength),
            ChunkLength,
            ct
        );

        await ctx
            .Expected.MediaItem(mediaItemId)
            .ToAwaitItsRenditions(MediaKind.Video, "video/mp4")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheUpload_When_TheCallerMayNotUploadToTheGallery()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("bernd")),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("bernd", ct);

        var response = await TusUploadSteps.CreateAsync(
            client,
            TusUploadSteps.GalleryOwner,
            "foto.jpg",
            ChunkLength,
            ct
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheUpload_When_NobodyIsSignedIn()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var response = await TusUploadSteps.CreateAsync(
            _fixture.CreateClient(),
            TusUploadSteps.GalleryOwner,
            "foto.jpg",
            ChunkLength,
            ct
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_GiveThePortraitToThePerson_When_SheUploadsHerOwn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var aliceId = ctx.Identity.People.IdOf("alice");
        var client = await ctx.Identity.ClientForAsync("alice", ct);

        var mediaItemId = await TusUploadSteps.UploadAsync(
            client,
            TusUploadSteps.PersonOwner(aliceId),
            "ich.jpg",
            MediaSamples.Jpeg(ChunkLength),
            ChunkLength,
            ct
        );

        await ctx
            .Expected.MediaItem(mediaItemId)
            .ToBeOwnedBy(MediaOwner.Person(aliceId))
            .AssertAsync(ct);
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
    public async Task Should_AcceptAnotherPersonsPortrait_When_TheCallerManagesPersons()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("vera").AddPerson("bernd"))
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "mitglieder",
                            "vera-mitglieder",
                            "Mitgliederverwaltung",
                            "vera",
                            FurriaPermissions.PersonsManage
                        )
                    ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("vera", ct);

        var response = await TusUploadSteps.CreateAsync(
            client,
            TusUploadSteps.PersonOwner(ctx.Identity.People.IdOf("bernd")),
            "bernd.jpg",
            ChunkLength,
            ct
        );

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Should_AcceptTheGroupPicture_When_TheCallerAdministersTheGroup()
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

        var mediaItemId = await TusUploadSteps.UploadAsync(
            client,
            TusUploadSteps.GroupOwner(groupId),
            "garde.jpg",
            MediaSamples.Jpeg(ChunkLength),
            ChunkLength,
            ct
        );

        await ctx
            .Expected.MediaItem(mediaItemId)
            .ToBeOwnedBy(MediaOwner.Group(groupId))
            .AssertAsync(ct);
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
    public async Task Should_RejectAVideo_When_ItIsMeantAsAPortrait()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var video = MediaSamples.Mp4(ChunkLength);
        var upload = await TusUploadSteps.CreatedAsync(
            client,
            TusUploadSteps.PersonOwner(ctx.Identity.People.IdOf("alice")),
            "ich.mp4",
            video.Length,
            ct
        );

        var response = await TusUploadSteps.PatchAsync(client, upload, 0, video, ct);

        Assert.Equal(HttpStatusCode.UnsupportedMediaType, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseThePortrait_When_ItIsLargerThanAPhotoMayBe()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("alice", ct);

        var response = await TusUploadSteps.CreateAsync(
            client,
            TusUploadSteps.PersonOwner(ctx.Identity.People.IdOf("alice")),
            "ich.jpg",
            BeyondThePhotoLimit,
            ct
        );

        Assert.Equal(HttpStatusCode.RequestEntityTooLarge, response.StatusCode);
    }

    [Fact]
    public async Task Should_RejectTheFirstChunk_When_AGalleryPhotoIsLargerThanAPhotoMayBe()
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
        var upload = await TusUploadSteps.CreatedAsync(
            client,
            TusUploadSteps.GalleryOwner,
            "riesig.jpg",
            BeyondThePhotoLimit,
            ct
        );

        var response = await TusUploadSteps.PatchAsync(
            client,
            upload,
            0,
            MediaSamples.Jpeg(ChunkLength),
            ct
        );

        Assert.Equal(HttpStatusCode.RequestEntityTooLarge, response.StatusCode);
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
}
