using System.Diagnostics.Contracts;
using System.Globalization;
using System.Text;
using System.Xml;
using System.Xml.Linq;

namespace Furria.Api.Website;

public static class SitemapXml
{
    public const string ContentType = "application/xml; charset=utf-8";

    private const string W3cDateTimeFormat = "yyyy-MM-dd'T'HH:mm:ss'Z'";

    private static readonly XNamespace SitemapNamespace =
        "http://www.sitemaps.org/schemas/sitemap/0.9";

    private static readonly XmlWriterSettings WriterSettings = new()
    {
        Encoding = new UTF8Encoding(encoderShouldEmitUTF8Identifier: false),
        Indent = true,
    };

    [Pure]
    public static string Of(IEnumerable<SitemapEntry> entries, string websiteBaseUrl)
    {
        var origin = WebsiteOrigin.Of(websiteBaseUrl);
        var document = new XDocument(
            new XDeclaration("1.0", "utf-8", null),
            new XElement(
                SitemapNamespace + "urlset",
                entries.Select(entry => UrlElementOf(entry, origin))
            )
        );

        return Serialized(document);
    }

    [Pure]
    private static XElement UrlElementOf(SitemapEntry entry, string origin) =>
        new(
            SitemapNamespace + "url",
            new XElement(SitemapNamespace + "loc", origin + entry.Path),
            new XElement(
                SitemapNamespace + "lastmod",
                entry
                    .ChangedAt.ToUniversalTime()
                    .ToString(W3cDateTimeFormat, CultureInfo.InvariantCulture)
            )
        );

    [Pure]
    private static string Serialized(XDocument document)
    {
        using var stream = new MemoryStream();
        using (var writer = XmlWriter.Create(stream, WriterSettings))
            document.Save(writer);

        return Encoding.UTF8.GetString(stream.ToArray());
    }
}
