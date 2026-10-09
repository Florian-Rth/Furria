using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Application.Authorization;
using Furria.Core.Media;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class GetGalleryInboxesTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Upload = new(2026, 10, 4, 9, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public GetGalleryInboxesTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ShowEveryInboxIncludingTheOwnerless_When_AManagerLooks()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Inboxes(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, result) = await client.GETAsync<GetGalleryInboxes, GetGalleryInboxesResponse>();

        Assert.Equal(
            [
                (ctx.Identity.People.IdOf("anna"), 0, 1),
                (null, 1, 0),
                (ctx.Identity.People.IdOf("markus"), 2, 0),
            ],
            result.Inboxes.Select(inbox => (inbox.Uploader?.PersonId, inbox.Photos, inbox.Videos))
        );
    }

    [Fact]
    public async Task Should_ShowOnlyHerOwnInbox_When_AnUploaderLooks()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Inboxes(), ct);
        var client = await ctx.Identity.ClientForAsync("markus", ct);

        var (_, result) = await client.GETAsync<GetGalleryInboxes, GetGalleryInboxesResponse>();

        Assert.Equal(
            [ctx.Identity.People.IdOf("markus")],
            result.Inboxes.Select(inbox => inbox.Uploader?.PersonId)
        );
    }

    private static Action<SeedContextBuilder> Inboxes() =>
        builder =>
            builder
                .Identity(identity => identity.AddAccount("markus").AddPerson("anna"))
                .Roles(roles =>
                    roles.AddRoleWithHolder(
                        "fotografie",
                        "fotografie-holding",
                        "Fotografie",
                        "markus",
                        FurriaPermissions.GalleryUpload
                    )
                )
                .Gallery(gallery =>
                    gallery
                        .AddGalleryItem("markus-one", "markus", uploadedAt: Upload)
                        .AddGalleryItem("markus-two", "markus", uploadedAt: Upload)
                        .AddGalleryItem("orphan", uploadedAt: Upload.AddHours(1))
                        .AddGalleryItem(
                            "anna-clip",
                            "anna",
                            kind: MediaKind.Video,
                            uploadedAt: Upload.AddHours(2)
                        )
                );
}
