using Furria.Api.Tests.Media;
using Furria.Tests.Common.Fixtures;
using NetVips;

namespace Furria.Api.Tests.Management;

internal static class SessionLogoSteps
{
    private const int LogoLength = 4096;
    private const int ChunkLength = 1024 * 1024;

    internal static Task<int> UploadAsync(HttpClient client, int sessionId, CancellationToken ct) =>
        TusUploadSteps.UploadAsync(
            client,
            SessionOwner(sessionId),
            "sessionslogo.jpg",
            MediaSamples.Jpeg(LogoLength),
            LogoLength,
            ct
        );

    internal static Task<int> UploadPngAsync(
        HttpClient client,
        int sessionId,
        byte[] png,
        CancellationToken ct
    ) =>
        TusUploadSteps.UploadAsync(
            client,
            SessionOwner(sessionId),
            "sessionslogo.png",
            png,
            ChunkLength,
            ct
        );

    internal static async Task<int> RenderedAsync(
        ApiTestFixture fixture,
        HttpClient client,
        int sessionId,
        CancellationToken ct
    )
    {
        var logoId = await UploadAsync(client, sessionId, ct);
        await fixture.RenderMediaItemDirectlyAsync(logoId, ct);
        return logoId;
    }

    internal static string SessionOwner(int sessionId) => $"session:{sessionId}";

    internal static byte[] TransparentPngWithAMark(int width, int height)
    {
        using var clear = Image.Black(width, height, bands: 4);
        using var blank = Image.Black(width / 2, height / 2, bands: 4);
        using var solid = blank.Linear([1.0, 1.0, 1.0, 1.0], [200.0, 30.0, 40.0, 255.0]);
        using var mark = solid.Cast(Enums.BandFormat.Uchar);
        using var logo = clear.Insert(mark, width / 4, height / 4);
        using var srgb = logo.Copy(interpretation: Enums.Interpretation.Srgb);
        return srgb.WriteToBuffer(".png");
    }

    internal static (double CornerAlpha, double CentreAlpha) AlphaOf(string webpPath)
    {
        using var image = Image.NewFromFile(webpPath);
        if (!image.HasAlpha())
            return (byte.MaxValue, byte.MaxValue);

        var alphaBand = image.Bands - 1;
        return (
            image.Getpoint(0, 0)[alphaBand],
            image.Getpoint(image.Width / 2, image.Height / 2)[alphaBand]
        );
    }
}
