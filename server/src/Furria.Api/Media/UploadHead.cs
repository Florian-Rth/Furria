using Furria.Core.Media;

namespace Furria.Api.Media;

public static class UploadHead
{
    private const string ItemKey = "Furria.UploadHead";
    private const string ChunkContentType = "application/offset+octet-stream";
    private const string UploadOffsetHeader = "Upload-Offset";
    private const string StartOffset = "0";

    public static async Task CaptureAsync(HttpContext http, RequestDelegate next)
    {
        if (IsFirstChunk(http.Request))
        {
            var head = await ReadHeadAsync(http.Request.Body, http.RequestAborted);
            http.Items[ItemKey] = head;
            http.Request.Body = new ReplayedHeadStream(head, http.Request.Body);
        }

        await next(http);
    }

    public static byte[] Of(HttpContext http) => http.Items[ItemKey] as byte[] ?? [];

    public static async Task<byte[]> ReadHeadAsync(Stream content, CancellationToken ct)
    {
        var head = new byte[MediaSniffer.HeadLength];
        var length = await content.ReadAtLeastAsync(
            head,
            head.Length,
            throwOnEndOfStream: false,
            ct
        );
        return head[..length];
    }

    private static bool IsFirstChunk(HttpRequest request) =>
        request.ContentType == ChunkContentType
        && (
            HttpMethods.IsPost(request.Method) || request.Headers[UploadOffsetHeader] == StartOffset
        );
}
