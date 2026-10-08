using System.Buffers.Text;
using System.Diagnostics.Contracts;
using System.Security.Cryptography;
using System.Text;
using Furria.Application.Media;
using Furria.Core.Media;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.Media;

public sealed class MediaUrlSigner
{
    public const string RoutePrefix = "/api/media";

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
        var signature = SignatureOf(mediaItemId, owner, rendition, expiresAt);

        return $"{RoutePrefix}/{mediaItemId}/{WireNameOf(rendition)}?exp={expiresAt}&sig={signature}";
    }

    public bool Verifies(MediaUrlQuery query) =>
        _timeProvider.GetUtcNow().ToUnixTimeSeconds() < query.ExpiresAt
        && CryptographicOperations.FixedTimeEquals(
            Encoding.ASCII.GetBytes(
                SignatureOf(query.MediaItemId, query.Owner, query.Rendition, query.ExpiresAt)
            ),
            Encoding.ASCII.GetBytes(query.Signature)
        );

    [Pure]
    public static string WireNameOf(MediaRendition rendition) =>
        rendition.ToString().ToLowerInvariant();

    [Pure]
    private static long ExpiryOf(DateTimeOffset now) =>
        (now.ToUnixTimeSeconds() / WindowSeconds + WindowsValid) * WindowSeconds;

    private string SignatureOf(
        int mediaItemId,
        MediaOwner owner,
        MediaRendition rendition,
        long expiresAt
    ) =>
        Base64Url.EncodeToString(
            HMACSHA256.HashData(
                _key,
                Encoding.UTF8.GetBytes(
                    $"{mediaItemId}/{WireNameOf(rendition)}/{owner.Token}/{expiresAt}"
                )
            )
        );
}
