using System.Globalization;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using Furria.Api.Media;
using Xunit;

namespace Furria.Api.Tests.Media;

public static class LinkUploadSteps
{
    private const string TusResumable = "Tus-Resumable";
    private const string TusVersion = "1.0.0";
    private const string ChunkContentType = "application/offset+octet-stream";

    public static Task<HttpResponseMessage> CreateAsync(
        HttpClient client,
        string? token,
        string fileName,
        long length,
        CancellationToken ct,
        string? uploaderName = null
    )
    {
        var request = new HttpRequestMessage(HttpMethod.Post, LinkUploads.UrlPath);
        request.Headers.Add(TusResumable, TusVersion);
        request.Headers.Add("Upload-Length", length.ToString(CultureInfo.InvariantCulture));
        request.Headers.Add(
            "Upload-Metadata",
            $"{MediaUploadEvents.FileNameMetadataKey} {Base64(fileName)}"
                + (
                    uploaderName is null
                        ? ""
                        : $",{LinkUploadEvents.UploaderNameMetadataKey} {Base64(uploaderName)}"
                )
        );
        WithToken(request, token);
        return client.SendAsync(request, ct);
    }

    public static async Task<Uri> CreatedAsync(
        HttpClient client,
        string token,
        string fileName,
        long length,
        CancellationToken ct,
        string? uploaderName = null
    )
    {
        var response = await CreateAsync(client, token, fileName, length, ct, uploaderName);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return response.Headers.Location!;
    }

    public static Task<HttpResponseMessage> PatchAsync(
        HttpClient client,
        string? token,
        Uri upload,
        long offset,
        ReadOnlyMemory<byte> chunk,
        CancellationToken ct
    )
    {
        var request = new HttpRequestMessage(HttpMethod.Patch, upload)
        {
            Content = new ByteArrayContent(chunk.ToArray()),
        };
        request.Headers.Add(TusResumable, TusVersion);
        request.Headers.Add("Upload-Offset", offset.ToString(CultureInfo.InvariantCulture));
        request.Content.Headers.ContentType = new MediaTypeHeaderValue(ChunkContentType);
        WithToken(request, token);
        return client.SendAsync(request, ct);
    }

    public static Task<HttpResponseMessage> HeadAsync(
        HttpClient client,
        string? token,
        Uri upload,
        CancellationToken ct
    )
    {
        var request = new HttpRequestMessage(HttpMethod.Head, upload);
        request.Headers.Add(TusResumable, TusVersion);
        WithToken(request, token);
        return client.SendAsync(request, ct);
    }

    public static async Task UploadAsync(
        HttpClient client,
        string token,
        string fileName,
        byte[] content,
        int chunkLength,
        CancellationToken ct,
        string? uploaderName = null
    )
    {
        var upload = await CreatedAsync(client, token, fileName, content.Length, ct, uploaderName);
        for (var offset = 0; offset < content.Length; offset += chunkLength)
        {
            var chunk = content.AsMemory(offset, Math.Min(chunkLength, content.Length - offset));
            var response = await PatchAsync(client, token, upload, offset, chunk, ct);
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }
    }

    private static void WithToken(HttpRequestMessage request, string? token)
    {
        if (token is not null)
            request.Headers.Add(LinkUploadPasses.TokenHeader, token);
    }

    private static string Base64(string value) =>
        Convert.ToBase64String(Encoding.UTF8.GetBytes(value));
}
