using FastEndpoints;
using Furria.Api.Endpoints.Start;
using Furria.Application.Start;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Start;

public sealed class GetStartGalleryTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly JoinedIn2015 = new(2015, 11, 11);

    private readonly ApiTestFixture _fixture;

    public GetStartGalleryTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ShowAlbumsCreatedInTheLastFortnightNewestFirst_When_AMemberOpensStart()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("lena")
                            .AddMembership("lena-membership", "lena", JoinedIn2015)
                    )
                    .Gallery(gallery =>
                        gallery
                            .AddAlbum(
                                "gala",
                                "Prunksitzung",
                                sessionStartYear: 2025,
                                createdAt: now.AddDays(-3)
                            )
                            .AddGalleryItem("gala-first", albumAlias: "gala")
                            .AddGalleryItem("gala-second", albumAlias: "gala")
                            .AddGalleryItem(
                                "gala-binned",
                                albumAlias: "gala",
                                binnedAt: now.AddDays(-1)
                            )
                            .AddAlbum(
                                "parade",
                                "Umzug",
                                sessionStartYear: 2025,
                                createdAt: now.AddDays(-1)
                            )
                            .AddGalleryItem("parade-first", albumAlias: "parade")
                            .AddAlbum(
                                "refilled",
                                "Ordensfest",
                                sessionStartYear: 2025,
                                createdAt: now.AddDays(-15)
                            )
                            .AddGalleryItem(
                                "refilled-fresh",
                                albumAlias: "refilled",
                                placedAt: now.AddDays(-1)
                            )
                            .AddAlbum(
                                "binned",
                                "Verworfen",
                                binnedAt: now,
                                createdAt: now.AddDays(-1)
                            )
                            .AddGalleryItem("binned-first", albumAlias: "binned")
                    ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("lena", ct);

        var (_, start) = await client.GETAsync<GetStart, GetStartResponse>();

        var panel = Assert.Single(start.Panels, panel => panel.Kind == StartPanelKind.Gallery);
        Assert.Equal(
            [(ctx.Gallery.Albums.IdOf("parade"), 1), (ctx.Gallery.Albums.IdOf("gala"), 2)],
            panel.Albums!.Select(album => (album.AlbumId, album.ItemCount))
        );
    }
}
