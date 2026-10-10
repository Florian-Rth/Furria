using Furria.Core.News;
using Xunit;

namespace Furria.Api.Tests.News;

public sealed class NewsTextTests
{
    [Fact]
    public void Should_AcceptEveryConstructOfTheSubset_When_TheTextKeepsToIt()
    {
        var reading = NewsText.Read(
            """
            Die **Prunksitzung** war ausverkauft, sagt @[Die Funkenmariechen](group:7).

            ## Wie es weitergeht

            - Proben ab Montag mit @[Paula Becker](person:12)
            - Karten unter [unserer Seite](https://rheinfunken.example/karten)

            Ein Absatz
            über zwei Zeilen.
            """
        );

        Assert.Null(reading.Refusal);
        Assert.Equal(
            [
                new NewsMention(NewsMentionKind.Group, 7),
                new NewsMention(NewsMentionKind.Person, 12),
            ],
            reading.Mentions
        );
    }

    [Fact]
    public void Should_NameEveryTargetOnce_When_ItIsMentionedTwice()
    {
        var reading = NewsText.Read("@[Paula](person:12) und nochmal @[Paula B.](person:12)");

        Assert.Equal([new NewsMention(NewsMentionKind.Person, 12)], reading.Mentions);
    }

    [Theory]
    [InlineData("1\\. FC Köln gewinnt")]
    [InlineData("Preis\\* gilt nur heute")]
    [InlineData("Eine \\[Klammer\\](nicht verlinkt)")]
    [InlineData("Ein [Klammerzusatz] bleibt Text")]
    [InlineData("Ich <3 Karneval und a < b")]
    [InlineData("Ein _Unterstrich_ bleibt Text")]
    [InlineData("C:\\Pfad bleibt ein Backslash")]
    [InlineData("")]
    public void Should_AcceptTheTextAsLiteral_When_ItOnlyResemblesMarkup(string text)
    {
        Assert.Null(NewsText.Read(text).Refusal);
    }

    [Theory]
    [InlineData("# Überschrift")]
    [InlineData("### Unterüberschrift")]
    [InlineData("> Zitat")]
    [InlineData("* Punkt")]
    [InlineData("+ Punkt")]
    [InlineData("1. Punkt")]
    [InlineData("- Punkt\n  - eingerückt")]
    [InlineData("    Code")]
    [InlineData("```\ncode\n```")]
    [InlineData("Absatz\n\n---")]
    [InlineData("Titel\n===")]
    [InlineData("Ein <b>fetter</b> Satz")]
    [InlineData("Ein <script>alert(1)</script>")]
    [InlineData("Ein ![Bild](https://example.com/a.jpg)")]
    [InlineData("Ein *kursiver* Satz")]
    [InlineData("Ein **offenes Fett")]
    [InlineData("Ein **** leeres Fett")]
    [InlineData("Ein `Code` im Satz")]
    [InlineData("[Klick](javascript:alert(1))")]
    [InlineData("[Klick](/intern)")]
    [InlineData("[](https://example.com)")]
    [InlineData("[**Fett**](https://example.com)")]
    [InlineData("@[Paula](role:3)")]
    [InlineData("@[Paula](person:abc)")]
    [InlineData("@[Paula](person:0)")]
    [InlineData("@[](person:3)")]
    [InlineData("-")]
    [InlineData("## ")]
    public void Should_RefuseTheText_When_ItUsesAConstructOutsideTheSubset(string text)
    {
        Assert.NotNull(NewsText.Read(text).Refusal);
    }

    [Fact]
    public void Should_ReadWindowsLineEndingsAsLines_When_TheTextComesFromABrowser()
    {
        Assert.Null(NewsText.Read("## Kopf\r\n\r\n- Punkt\r\n- Punkt").Refusal);
    }
}
