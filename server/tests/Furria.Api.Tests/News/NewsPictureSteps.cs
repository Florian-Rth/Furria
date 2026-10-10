using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.News;
using Furria.Api.Tests.Media;
using Xunit;

namespace Furria.Api.Tests.News;

internal static class NewsPictureSteps
{
    private const int PictureLength = 4096;

    internal static Task<int> UploadAsync(
        HttpClient client,
        int newsPostId,
        CancellationToken ct
    ) =>
        TusUploadSteps.UploadAsync(
            client,
            TusUploadSteps.NewsPostOwner(newsPostId),
            "banner.jpg",
            MediaSamples.Jpeg(PictureLength),
            PictureLength,
            ct
        );

    internal static async Task<int> LivePictureAsync(
        HttpClient client,
        int newsPostId,
        CancellationToken ct
    )
    {
        var pictureId = await UploadAsync(client, newsPostId, ct);
        var publication = await client.POSTAsync<
            PublishNewsPostChanges,
            PublishNewsPostChangesRequest
        >(new() { NewsPostId = newsPostId });
        Assert.Equal(HttpStatusCode.OK, publication.StatusCode);
        return pictureId;
    }
}
