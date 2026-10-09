using System.IO.Compression;
using FastEndpoints;
using FluentValidation;
using Furria.Api.Media;
using Furria.Application.Gallery;
using Furria.Infrastructure.Gallery;
using Furria.Infrastructure.Media;
using Microsoft.Net.Http.Headers;

namespace Furria.Api.Endpoints.Gallery;

public sealed class GetGalleryAlbumZip : Endpoint<GetGalleryAlbumZipRequest>
{
    private const string ZipContentType = "application/zip";
    private const string ZipExtension = ".zip";
    private const char FileNameStandIn = '_';

    private readonly GalleryService _galleryService;
    private readonly MediaUrlSigner _signer;

    public GetGalleryAlbumZip(GalleryService galleryService, MediaUrlSigner signer)
    {
        _galleryService = galleryService;
        _signer = signer;
    }

    public override void Configure()
    {
        Get("gallery/albums/{albumId}/zip");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetGalleryAlbumZipRequest req, CancellationToken ct)
    {
        if (!_signer.VerifiesAlbumZip(req.AlbumId, req.Exp, req.Sig))
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        var zip = await _galleryService.ZipOfAsync(req.AlbumId, ct);
        if (zip is null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        HttpContext.Response.ContentType = ZipContentType;
        HttpContext.Response.Headers.ContentDisposition = DispositionOf(zip.Title);
        await HttpContext.Response.StartAsync(ct);
        await WriteArchiveAsync(HttpContext.Response.Body, zip.Entries, ct);
    }

    private static async Task WriteArchiveAsync(
        Stream body,
        IReadOnlyList<AlbumZipEntry> entries,
        CancellationToken ct
    )
    {
        await using var output = new DeferredSyncWriteStream(body);
        await using (
            var archive = await ZipArchive.CreateAsync(
                output,
                ZipArchiveMode.Create,
                leaveOpen: true,
                entryNameEncoding: null,
                ct
            )
        )
        {
            foreach (var entry in entries.Where(entry => File.Exists(entry.FullPath)))
                await WriteEntryAsync(archive, entry, ct);
        }

        await output.FlushAsync(ct);
    }

    private static async Task WriteEntryAsync(
        ZipArchive archive,
        AlbumZipEntry entry,
        CancellationToken ct
    )
    {
        var zipEntry = archive.CreateEntry(entry.Name, CompressionLevel.NoCompression);
        zipEntry.LastWriteTime = entry.ModifiedAt;
        await using var target = await zipEntry.OpenAsync(ct);
        await using var source = File.OpenRead(entry.FullPath);
        await source.CopyToAsync(target, ct);
    }

    private static string DispositionOf(string title) =>
        new ContentDispositionHeaderValue("attachment")
        {
            FileNameStar = FileNameOf(title) + ZipExtension,
        }.ToString();

    private static string FileNameOf(string title) =>
        string.Concat(
            title
                .Trim()
                .Select(character =>
                    Path.GetInvalidFileNameChars().Contains(character) ? FileNameStandIn : character
                )
        );
}

public sealed record GetGalleryAlbumZipRequest
{
    [RouteParam]
    public required int AlbumId { get; init; }

    [QueryParam]
    public long Exp { get; init; }

    [QueryParam]
    public string Sig { get; init; } = "";
}

public sealed class GetGalleryAlbumZipValidator : Validator<GetGalleryAlbumZipRequest>
{
    public GetGalleryAlbumZipValidator()
    {
        RuleFor(request => request.AlbumId).GreaterThan(0);
    }
}
