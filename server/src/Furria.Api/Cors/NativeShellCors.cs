namespace Furria.Api.Cors;

public static class NativeShellCors
{
    private static readonly string[] Origins = ["https://localhost", "capacitor://localhost"];
    private static readonly string[] Headers = ["authorization", "content-type"];
    private static readonly string[] Methods = ["GET", "POST", "PUT", "DELETE"];

    public static IServiceCollection AddNativeShellCors(this IServiceCollection services) =>
        services.AddCors(cors =>
            cors.AddDefaultPolicy(policy =>
                policy.WithOrigins(Origins).WithHeaders(Headers).WithMethods(Methods)
            )
        );
}
