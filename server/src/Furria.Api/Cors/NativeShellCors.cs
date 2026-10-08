namespace Furria.Api.Cors;

public static class NativeShellCors
{
    private static readonly string[] Origins = ["https://localhost", "capacitor://localhost"];
    private static readonly string[] Headers =
    [
        "authorization",
        "content-type",
        "tus-resumable",
        "upload-length",
        "upload-metadata",
        "upload-offset",
    ];
    private static readonly string[] Methods = ["GET", "POST", "PUT", "PATCH", "HEAD", "DELETE"];
    private static readonly string[] ExposedHeaders =
    [
        "location",
        "tus-resumable",
        "upload-length",
        "upload-offset",
        "media-item-id",
    ];

    public static IServiceCollection AddNativeShellCors(this IServiceCollection services) =>
        services.AddCors(cors =>
            cors.AddDefaultPolicy(policy =>
                policy
                    .WithOrigins(Origins)
                    .WithHeaders(Headers)
                    .WithMethods(Methods)
                    .WithExposedHeaders(ExposedHeaders)
            )
        );
}
