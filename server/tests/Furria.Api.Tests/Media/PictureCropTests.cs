using Furria.Core.Media;
using Xunit;

namespace Furria.Api.Tests.Media;

public sealed class PictureCropTests
{
    private const double Precision = 1e-9;

    public static TheoryData<string, int, int, double, PictureCrop> CentredFrames =>
        new()
        {
            { "a landscape photo as a portrait", 4000, 3000, 4.0 / 5, new(0.2, 0, 0.6, 1) },
            { "a portrait photo as a portrait", 3000, 4000, 4.0 / 5, new(0, 0.03125, 1, 0.9375) },
            { "a portrait photo as a group picture", 3000, 4000, 3.0 / 2, new(0, 0.25, 1, 0.5) },
            { "a 3:2 photo as a group picture", 6000, 4000, 3.0 / 2, new(0, 0, 1, 1) },
        };

    public static TheoryData<string, PictureCrop, PictureCrop> FittedCrops =>
        new()
        {
            {
                "too wide narrows around its centre",
                new(0.1, 0.1, 0.8, 0.5),
                new(0.25, 0.1, 0.5, 0.5)
            },
            { "too tall shortens around its centre", new(0.2, 0, 0.4, 1), new(0.2, 0.3, 0.4, 0.4) },
            {
                "reaching past the edge is held inside",
                new(0.6, 0.5, 0.8, 0.8),
                new(0.6, 0.55, 0.4, 0.4)
            },
        };

    public static TheoryData<string, string?> RefusedTokens =>
        new()
        {
            { "nothing", null },
            { "three numbers", "0.1,0.1,0.5" },
            { "a word", "links,0,1,1" },
            { "a negative edge", "-0.1,0,0.5,0.5" },
            { "no width", "0,0,0,0.5" },
            { "past the right edge", "0.6,0,0.5,0.5" },
            { "past the bottom edge", "0,0.6,0.5,0.5" },
            { "not a number", "NaN,0,0.5,0.5" },
        };

    [Theory]
    [MemberData(nameof(CentredFrames))]
    public void Should_FrameTheLargestCentredCut_When_NoCropWasChosen(
        string _,
        int width,
        int height,
        double aspect,
        PictureCrop expected
    ) => AssertClose(expected, PictureCrop.Centred(width, height, aspect));

    [Theory]
    [MemberData(nameof(FittedCrops))]
    public void Should_HoldTheFrameAspect_When_AChosenCropMissesIt(
        string _,
        PictureCrop chosen,
        PictureCrop expected
    ) => AssertClose(expected, chosen.FittedTo(1000, 1000, 1));

    [Fact]
    public void Should_ReadTheCropBack_When_ItTravelsAsAToken()
    {
        var crop = new PictureCrop(0.125, 0.0625, 0.5, 0.625);

        Assert.Equal(crop, PictureCrop.Parse(crop.Token));
    }

    [Theory]
    [MemberData(nameof(RefusedTokens))]
    public void Should_RefuseTheCrop_When_ItIsNoCutOfThePicture(string _, string? token) =>
        Assert.Null(PictureCrop.Parse(token));

    private static void AssertClose(PictureCrop expected, PictureCrop actual)
    {
        Assert.Equal(expected.Left, actual.Left, Precision);
        Assert.Equal(expected.Top, actual.Top, Precision);
        Assert.Equal(expected.Width, actual.Width, Precision);
        Assert.Equal(expected.Height, actual.Height, Precision);
    }
}
