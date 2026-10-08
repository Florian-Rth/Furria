using Furria.MediaWorker.Videos;
using Xunit;

namespace Furria.Api.Tests.Media;

public sealed class VideoEncodingTests
{
    public static TheoryData<string, int, int, int, int> Sizes =>
        new()
        {
            { "4K landscape", 3840, 2160, 1920, 1080 },
            { "4K portrait", 2160, 3840, 1080, 1920 },
            { "square", 2000, 2000, 1080, 1080 },
            { "cinema scope", 4096, 1716, 1920, 804 },
            { "already small", 640, 360, 640, 360 },
            { "odd camcorder size", 721, 405, 720, 404 },
        };

    [Theory]
    [MemberData(nameof(Sizes))]
    public void Should_FitTheVideoInto1080pWithoutUpscaling_When_ItIsTranscoded(
        string _,
        int width,
        int height,
        int expectedWidth,
        int expectedHeight
    )
    {
        Assert.Equal((expectedWidth, expectedHeight), VideoEncoding.TargetSizeOf(width, height));
    }
}
