using System.Globalization;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using Furria.Api.Media;
using Xunit;

namespace Furria.Api.Tests.Media;

public static class TusUploadSteps
{
    public const string GalleryOwner = "gallery";

    private const string TusResumable = "Tus-Resumable";
    private const string TusVersion = "1.0.0";
    private const string ChunkContentType = "application/offset+octet-stream";

    public static string PersonOwner(int personId) => $"person:{personId}";

    public static string GroupOwner(int groupId) => $"group:{groupId}";

    public static string NewsPostOwner(int newsPostId) => $"news:{newsPostId}";

    public static Task<HttpResponseMessage> CreateAsync(
        HttpClient client,
        string owner,
        string fileName,
        long length,
        CancellationToken ct,
        int? albumId = null
    ) => CreateAsync(client, owner, fileName, length, null, ct, albumId);

    public static Task<HttpResponseMessage> CreateAsync(
        HttpClient client,
        string owner,
        string fileName,
        long length,
        string? crop,
        CancellationToken ct,
        int? albumId = null
    )
    {
        var request = new HttpRequestMessage(HttpMethod.Post, MediaUploads.UrlPath);
        request.Headers.Add(TusResumable, TusVersion);
        request.Headers.Add("Upload-Length", length.ToString(CultureInfo.InvariantCulture));
        var cropMetadata = crop is null
            ? ""
            : $",{MediaUploadEvents.CropMetadataKey} {Base64(crop)}";
        request.Headers.Add(
            "Upload-Metadata",
            $"{MediaUploadEvents.OwnerMetadataKey} {Base64(owner)},"
                + $"{MediaUploadEvents.FileNameMetadataKey} {Base64(fileName)}"
                + (
                    albumId is { } album
                        ? $",{MediaUploadEvents.AlbumMetadataKey} {Base64(album.ToString(CultureInfo.InvariantCulture))}"
                        : ""
                )
                + cropMetadata
        );
        return client.SendAsync(request, ct);
    }

    public static async Task<Uri> CreatedAsync(
        HttpClient client,
        string owner,
        string fileName,
        long length,
        CancellationToken ct,
        int? albumId = null
    ) => await CreatedAsync(client, owner, fileName, length, null, ct, albumId);

    public static async Task<Uri> CreatedAsync(
        HttpClient client,
        string owner,
        string fileName,
        long length,
        string? crop,
        CancellationToken ct,
        int? albumId = null
    )
    {
        var response = await CreateAsync(client, owner, fileName, length, crop, ct, albumId);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        return response.Headers.Location!;
    }

    public static Task<HttpResponseMessage> PatchAsync(
        HttpClient client,
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
        return client.SendAsync(request, ct);
    }

    public static Task<HttpResponseMessage> HeadAsync(
        HttpClient client,
        Uri upload,
        CancellationToken ct
    )
    {
        var request = new HttpRequestMessage(HttpMethod.Head, upload);
        request.Headers.Add(TusResumable, TusVersion);
        return client.SendAsync(request, ct);
    }

    public static Task<int> UploadAsync(
        HttpClient client,
        string owner,
        string fileName,
        byte[] content,
        int chunkLength,
        CancellationToken ct,
        int? albumId = null
    ) => UploadAsync(client, owner, fileName, content, chunkLength, null, ct, albumId);

    public static async Task<int> UploadAsync(
        HttpClient client,
        string owner,
        string fileName,
        byte[] content,
        int chunkLength,
        string? crop,
        CancellationToken ct,
        int? albumId = null
    )
    {
        var upload = await CreatedAsync(client, owner, fileName, content.Length, crop, ct, albumId);
        HttpResponseMessage? last = null;
        for (var offset = 0; offset < content.Length; offset += chunkLength)
        {
            var chunk = content.AsMemory(offset, Math.Min(chunkLength, content.Length - offset));
            last = await PatchAsync(client, upload, offset, chunk, ct);
            Assert.Equal(HttpStatusCode.NoContent, last.StatusCode);
        }

        return MediaItemIdOf(last!);
    }

    public static int MediaItemIdOf(HttpResponseMessage response) =>
        int.Parse(
            response.Headers.GetValues(MediaUploadEvents.MediaItemIdHeader).Single(),
            CultureInfo.InvariantCulture
        );

    private static string Base64(string value) =>
        Convert.ToBase64String(Encoding.UTF8.GetBytes(value));
}
