using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class GetGalleryTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset GalaEvening = new(2026, 2, 14, 19, 11, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset ParadeNoon = new(2026, 2, 16, 13, 0, 0, TimeSpan.Zero);
    private readonly ApiTestFixture _fixture;

    public GetGalleryTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CoverWithTheChosenElseTheFirstSelected_When_AnAlbumHasBoth()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddAccount("lena").AddMembership("lena-membership", "lena")
                    )
                    .Gallery(gallery =>
                        gallery
                            .AddAlbum(
                                "chosen",
                                "Gewählt",
                                sessionStartYear: 2025,
                                coverItemAlias: "chosen-cover"
                            )
                            .AddGalleryItem(
                                "chosen-first",
                                "lena",
                                "chosen",
                                capturedAt: GalaEvening
                            )
                            .AddGalleryItem(
                                "chosen-cover",
                                "lena",
                                "chosen",
                                capturedAt: ParadeNoon
                            )
                            .AddAlbum("selected", "Ausgewählt", sessionStartYear: 2024)
                            .AddGalleryItem(
                                "selected-first",
                                "lena",
                                "selected",
                                capturedAt: GalaEvening
                            )
                            .AddGalleryItem(
                                "selected-second",
                                "lena",
                                "selected",
                                capturedAt: ParadeNoon,
                                selectionPosition: 1
                            )
                    ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("lena", ct);

        var (_, result) = await client.GETAsync<GetGallery, GetGalleryResponse>();

        var covers = result
            .Sections.SelectMany(section => section.Albums)
            .ToDictionary(album => album.AlbumId, album => album.Cover?.MediaItemId);
        Assert.Equal(
            ctx.Gallery.Items.IdOf("chosen-cover"),
            covers[ctx.Gallery.Albums.IdOf("chosen")]
        );
        Assert.Equal(
            ctx.Gallery.Items.IdOf("selected-second"),
            covers[ctx.Gallery.Albums.IdOf("selected")]
        );
    }
}
