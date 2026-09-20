using Furria.Core.Club;
using Xunit;

namespace Furria.Api.Tests.Club;

public sealed class SvgSanitizerTests
{
    [Fact]
    public void Should_KeepTheArtworkAsItIs_When_NothingInItIsDangerous()
    {
        const string artwork =
            "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 10 10\">"
            + "<circle cx=\"5\" cy=\"5\" r=\"4\" fill=\"#c8102e\" />"
            + "</svg>";

        Assert.True(SvgSanitizer.TrySanitize(artwork, out var sanitized));
        Assert.Equal(artwork, sanitized);
    }

    [Fact]
    public void Should_DropTheScript_When_TheArtworkCarriesOne()
    {
        const string artwork =
            "<svg xmlns=\"http://www.w3.org/2000/svg\">"
            + "<script>alert(1)</script>"
            + "<circle cx=\"5\" cy=\"5\" r=\"4\" />"
            + "</svg>";

        Assert.True(SvgSanitizer.TrySanitize(artwork, out var sanitized));
        Assert.Equal(
            "<svg xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"5\" cy=\"5\" r=\"4\" /></svg>",
            sanitized
        );
    }

    [Fact]
    public void Should_DropTheHandler_When_AnElementListensForAnEvent()
    {
        const string artwork =
            "<svg xmlns=\"http://www.w3.org/2000/svg\" onload=\"alert(1)\">"
            + "<circle cx=\"5\" cy=\"5\" r=\"4\" onClick=\"alert(2)\" />"
            + "</svg>";

        Assert.True(SvgSanitizer.TrySanitize(artwork, out var sanitized));
        Assert.Equal(
            "<svg xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"5\" cy=\"5\" r=\"4\" /></svg>",
            sanitized
        );
    }

    [Fact]
    public void Should_DropTheReference_When_ItPointsOutsideTheArtwork()
    {
        const string artwork =
            "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">"
            + "<image href=\"https://example.invalid/tracker.png\" />"
            + "<use xlink:href=\"https://example.invalid/shapes.svg#orden\" />"
            + "</svg>";

        Assert.True(SvgSanitizer.TrySanitize(artwork, out var sanitized));
        Assert.DoesNotContain("example.invalid", sanitized);
    }

    [Fact]
    public void Should_KeepTheReference_When_ItPointsIntoTheArtworkItself()
    {
        const string artwork =
            "<svg xmlns=\"http://www.w3.org/2000/svg\">"
            + "<defs><linearGradient id=\"orden\" /></defs>"
            + "<circle cx=\"5\" cy=\"5\" r=\"4\" fill=\"url(#orden)\" />"
            + "</svg>";

        Assert.True(SvgSanitizer.TrySanitize(artwork, out var sanitized));
        Assert.Equal(artwork, sanitized);
    }

    [Fact]
    public void Should_DropTheLink_When_ItRunsScriptInsteadOfNavigating()
    {
        const string artwork =
            "<svg xmlns=\"http://www.w3.org/2000/svg\">"
            + "<a href=\"javascript:alert(1)\"><circle cx=\"5\" cy=\"5\" r=\"4\" /></a>"
            + "</svg>";

        Assert.True(SvgSanitizer.TrySanitize(artwork, out var sanitized));
        Assert.DoesNotContain("javascript", sanitized);
    }

    [Fact]
    public void Should_DropTheForeignObject_When_TheArtworkSmugglesMarkupFromAnotherLanguage()
    {
        const string artwork =
            "<svg xmlns=\"http://www.w3.org/2000/svg\">"
            + "<foreignObject><body xmlns=\"http://www.w3.org/1999/xhtml\">"
            + "<object data=\"https://example.invalid/payload\" /></body></foreignObject>"
            + "<circle cx=\"5\" cy=\"5\" r=\"4\" />"
            + "</svg>";

        Assert.True(SvgSanitizer.TrySanitize(artwork, out var sanitized));
        Assert.Equal(
            "<svg xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"5\" cy=\"5\" r=\"4\" /></svg>",
            sanitized
        );
    }

    [Fact]
    public void Should_RefuseTheArtwork_When_TheMarkupDoesNotParse()
    {
        Assert.False(SvgSanitizer.TrySanitize("<svg><circle cx=\"5\"</svg>", out var sanitized));
        Assert.Null(sanitized);
    }

    [Fact]
    public void Should_RefuseTheArtwork_When_ItsRootIsNotAnSvg()
    {
        Assert.False(
            SvgSanitizer.TrySanitize(
                "<html xmlns=\"http://www.w3.org/1999/xhtml\"><body /></html>",
                out var sanitized
            )
        );
        Assert.Null(sanitized);
    }

    [Fact]
    public void Should_RefuseTheArtwork_When_ItDeclaresItsOwnEntities()
    {
        const string artwork =
            "<!DOCTYPE svg [<!ENTITY orden \"gefaehrlich\">]>"
            + "<svg xmlns=\"http://www.w3.org/2000/svg\"><title>&orden;</title></svg>";

        Assert.False(SvgSanitizer.TrySanitize(artwork, out var sanitized));
        Assert.Null(sanitized);
    }
}
