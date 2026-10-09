using Furria.Tests.Common.Fixtures;

namespace Furria.Api.Tests.Media;

public static class PictureSteps
{
    private const int PictureLength = 4096;

    public static Task<int> RenderedPortraitAsync(
        ApiTestFixture fixture,
        HttpClient client,
        int personId,
        CancellationToken ct
    ) => RenderedAsync(fixture, client, TusUploadSteps.PersonOwner(personId), ct);

    public static Task<int> RenderedGroupPictureAsync(
        ApiTestFixture fixture,
        HttpClient client,
        int groupId,
        CancellationToken ct
    ) => RenderedAsync(fixture, client, TusUploadSteps.GroupOwner(groupId), ct);

    public static Task<int> UploadedPortraitAsync(
        HttpClient client,
        int personId,
        CancellationToken ct
    ) =>
        TusUploadSteps.UploadAsync(
            client,
            TusUploadSteps.PersonOwner(personId),
            "portrait.jpg",
            MediaSamples.Jpeg(PictureLength),
            PictureLength,
            ct
        );

    private static async Task<int> RenderedAsync(
        ApiTestFixture fixture,
        HttpClient client,
        string owner,
        CancellationToken ct
    )
    {
        var mediaItemId = await TusUploadSteps.UploadAsync(
            client,
            owner,
            "picture.jpg",
            MediaSamples.Jpeg(PictureLength),
            PictureLength,
            ct
        );
        await fixture.RenderMediaItemDirectlyAsync(mediaItemId, ct);
        return mediaItemId;
    }
}
