using System.Globalization;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using Furria.Api.Media;
using Furria.Core.Media;
using Furria.Infrastructure.Persistence;
using Furria.Tests.Common.Fixtures;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Furria.Api.Tests.Intakes;

internal static class IntakePortraits
{
    internal const int ChunkLength = 4096;

    private const string TusResumable = "Tus-Resumable";
    private const string TusVersion = "1.0.0";
    private const string ChunkContentType = "application/offset+octet-stream";

    internal static Task<HttpResponseMessage> CreateAsync(
        HttpClient client,
        string token,
        long length,
        CancellationToken ct,
        string? crop = null
    )
    {
        var request = new HttpRequestMessage(HttpMethod.Post, IntakeUploads.UrlPath);
        request.Headers.Add(TusResumable, TusVersion);
        request.Headers.Add("Upload-Length", length.ToString(CultureInfo.InvariantCulture));
        request.Headers.Add(
            "Upload-Metadata",
            $"{MediaUploadEvents.FileNameMetadataKey} {Base64("ich.jpg")}"
                + (crop is null ? "" : $",{MediaUploadEvents.CropMetadataKey} {Base64(crop)}")
        );
        request.Headers.Add(IntakeUploadPasses.TokenHeader, token);
        return client.SendAsync(request, ct);
    }

    internal static async Task<HttpStatusCode> UploadAsync(
        HttpClient client,
        string token,
        byte[] content,
        CancellationToken ct,
        string? crop = null
    )
    {
        var created = await CreateAsync(client, token, content.Length, ct, crop);
        if (created.StatusCode != HttpStatusCode.Created)
            return created.StatusCode;

        var request = new HttpRequestMessage(HttpMethod.Patch, created.Headers.Location)
        {
            Content = new ByteArrayContent(content),
        };
        request.Headers.Add(TusResumable, TusVersion);
        request.Headers.Add("Upload-Offset", "0");
        request.Headers.Add(IntakeUploadPasses.TokenHeader, token);
        request.Content.Headers.ContentType = new MediaTypeHeaderValue(ChunkContentType);
        return (await client.SendAsync(request, ct)).StatusCode;
    }

    internal static async Task UploadedAsync(
        HttpClient client,
        string token,
        CancellationToken ct
    ) =>
        Assert.Equal(
            HttpStatusCode.NoContent,
            await UploadAsync(client, token, Media.MediaSamples.Jpeg(ChunkLength), ct)
        );

    internal static async Task<IReadOnlyList<int>> HeldByAsync(
        ApiTestFixture fixture,
        int intakeId,
        CancellationToken ct
    )
    {
        await using var scope = fixture.Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        return await dbContext
            .MediaItems.AsNoTracking()
            .Where(item =>
                item.OwnerKind == MediaOwnerKind.Intake && item.OwnerIntakeId == intakeId
            )
            .OrderBy(item => item.Id)
            .Select(item => item.Id)
            .ToListAsync(ct);
    }

    private static string Base64(string value) =>
        Convert.ToBase64String(Encoding.UTF8.GetBytes(value));
}
