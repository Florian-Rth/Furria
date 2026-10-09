using System.Buffers.Text;
using System.Diagnostics.Contracts;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using Furria.Application.Media;
using Furria.Core.Media;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.Media;

public sealed class MediaUrlSigner
{
    public const string RoutePrefix = "/api/media";
    public const string AlbumZipRoute = "/api/gallery/albums/{0}/zip";

    private const long WindowSeconds = 24 * 60 * 60;
    private const long WindowsValid = 2;

    private readonly byte[] _key;
    private readonly TimeProvider _timeProvider;

    public MediaUrlSigner(IOptions<MediaOptions> options, TimeProvider timeProvider)
    {
        _key = Encoding.UTF8.GetBytes(options.Value.SigningKey);
        _timeProvider = timeProvider;
    }

    public string UrlOf(int mediaItemId, MediaOwner owner, MediaRendition rendition)
    {
        var expiresAt = ExpiryOf(_timeProvider.GetUtcNow());
        var signature = SignatureOf(RenditionPayloadOf(mediaItemId, owner, rendition, expiresAt));

        return $"{RoutePrefix}/{mediaItemId}/{WireNameOf(rendition)}?exp={expiresAt}&sig={signature}";
    }

    public string AlbumZipUrlOf(int albumId)
    {
        var expiresAt = ExpiryOf(_timeProvider.GetUtcNow());
        var route = string.Format(CultureInfo.InvariantCulture, AlbumZipRoute, albumId);

        return $"{route}?exp={expiresAt}&sig={SignatureOf(AlbumZipPayloadOf(albumId, expiresAt))}";
    }

    public bool Verifies(MediaUrlQuery query) =>
        IsValid(
            query.ExpiresAt,
            SignatureOf(
                RenditionPayloadOf(query.MediaItemId, query.Owner, query.Rendition, query.ExpiresAt)
            ),
            query.Signature
        );

    public bool VerifiesAlbumZip(int albumId, long expiresAt, string signature) =>
        IsValid(expiresAt, SignatureOf(AlbumZipPayloadOf(albumId, expiresAt)), signature);

    [Pure]
    public static string WireNameOf(MediaRendition rendition) =>
        rendition.ToString().ToLowerInvariant();

    [Pure]
    private static long ExpiryOf(DateTimeOffset now) =>
        (now.ToUnixTimeSeconds() / WindowSeconds + WindowsValid) * WindowSeconds;

    [Pure]
    private static string RenditionPayloadOf(
        int mediaItemId,
        MediaOwner owner,
        MediaRendition rendition,
        long expiresAt
    ) => $"{mediaItemId}/{WireNameOf(rendition)}/{owner.Token}/{expiresAt}";

    [Pure]
    private static string AlbumZipPayloadOf(int albumId, long expiresAt) =>
        $"album/{albumId}/zip/{expiresAt}";

    private bool IsValid(long expiresAt, string expectedSignature, string signature) =>
        _timeProvider.GetUtcNow().ToUnixTimeSeconds() < expiresAt
        && CryptographicOperations.FixedTimeEquals(
            Encoding.ASCII.GetBytes(expectedSignature),
            Encoding.ASCII.GetBytes(signature)
        );

    private string SignatureOf(string payload) =>
        Base64Url.EncodeToString(HMACSHA256.HashData(_key, Encoding.UTF8.GetBytes(payload)));
}
