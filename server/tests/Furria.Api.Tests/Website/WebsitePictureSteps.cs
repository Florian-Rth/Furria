using System.Globalization;
using Furria.Api.Tests.Media;
using Furria.Tests.Common.Fixtures;

namespace Furria.Api.Tests.Website;

internal static class WebsitePictureSteps
{
    internal const double Landscape = 7.0 / 5;

    private const int PictureLength = 4096;

    internal static Task<int> UploadAsync(
        HttpClient client,
        string slotKey,
        int position,
        double aspect,
        CancellationToken ct
    ) =>
        TusUploadSteps.UploadAsync(
            client,
            TusUploadSteps.WebsiteOwner(slotKey, position),
            "buehne.jpg",
            MediaSamples.Jpeg(PictureLength),
            PictureLength,
            crop: null,
            ct,
            aspect: AspectToken(aspect)
        );

    internal static async Task<int> RenderedAsync(
        ApiTestFixture fixture,
        HttpClient client,
        string slotKey,
        int position,
        CancellationToken ct
    )
    {
        var mediaItemId = await UploadAsync(client, slotKey, position, Landscape, ct);
        await fixture.RenderMediaItemDirectlyAsync(mediaItemId, ct);
        return mediaItemId;
    }

    internal static string AspectToken(double aspect) =>
        aspect.ToString("R", CultureInfo.InvariantCulture);
}
