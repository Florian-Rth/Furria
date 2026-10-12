using Microsoft.AspNetCore.ResponseCompression;

namespace Furria.Api.Compression;

public static class JsonCompression
{
    private static readonly string[] CompressedMimeTypes = ["application/json"];

    public static IServiceCollection AddJsonCompression(this IServiceCollection services) =>
        services.AddResponseCompression(compression =>
        {
            compression.EnableForHttps = true;
            compression.MimeTypes = CompressedMimeTypes;
            compression.Providers.Add<BrotliCompressionProvider>();
            compression.Providers.Add<GzipCompressionProvider>();
        });
}
