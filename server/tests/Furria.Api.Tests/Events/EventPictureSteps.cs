using Furria.Api.Tests.Media;
using Furria.Tests.Common.Fixtures;

namespace Furria.Api.Tests.Events;

internal static class EventPictureSteps
{
    private const int PictureLength = 4096;

    internal static Task<int> UploadAsync(HttpClient client, int eventId, CancellationToken ct) =>
        TusUploadSteps.UploadAsync(
            client,
            TusUploadSteps.EventOwner(eventId),
            "gala.jpg",
            MediaSamples.Jpeg(PictureLength),
            PictureLength,
            ct
        );

    internal static async Task<int> RenderedAsync(
        ApiTestFixture fixture,
        HttpClient client,
        int eventId,
        CancellationToken ct
    )
    {
        var pictureId = await UploadAsync(client, eventId, ct);
        await fixture.RenderMediaItemDirectlyAsync(pictureId, ct);
        return pictureId;
    }
}
