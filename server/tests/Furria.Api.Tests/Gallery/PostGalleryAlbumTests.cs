using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class PostGalleryAlbumTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Gala = new(2026, 2, 14, 19, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public PostGalleryAlbumTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CreateAnAlbumOnACalendarEntry_When_AnUploaderNamesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("markus"))
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "fotografie",
                            "fotografie-holding",
                            "Fotografie",
                            "markus",
                            FurriaPermissions.GalleryUpload
                        )
                    )
                    .Club(club => club.AddCalendarEntry("gala", "Prunksitzung", Gala)),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("markus", ct);

        var (response, result) = await client.POSTAsync<
            PostGalleryAlbum,
            PostGalleryAlbumRequest,
            PostGalleryAlbumResponse
        >(
            new()
            {
                Title = "  Prunksitzung 2026 ",
                Description = " ",
                CalendarEntryId = ctx.Club.CalendarEntries.IdOf("gala"),
                SessionStartYear = null,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.Album(result.AlbumId)
            .ToBeTitled("Prunksitzung 2026", null)
            .Album(result.AlbumId)
            .ToBeLinkedTo(ctx.Club.CalendarEntries.IdOf("gala"), null)
            .Album(result.AlbumId)
            .ToBeUnpublished()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheAlbum_When_ItsSessionHasNotBegun()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (response, _) = await client.POSTAsync<
            PostGalleryAlbum,
            PostGalleryAlbumRequest,
            PostGalleryAlbumResponse
        >(
            new()
            {
                Title = "Zukunft",
                Description = null,
                CalendarEntryId = null,
                SessionStartYear = _fixture.CurrentSessionYear + 2,
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }
}
