using Furria.Application.Gallery;
using Furria.Infrastructure.Gallery;

namespace Furria.Api.Media;

public static class LinkUploadPasses
{
    public const string TokenHeader = "Upload-Link-Token";

    private const string ItemKey = "Furria.LinkUploadPass";

    public static async Task CaptureAsync(HttpContext http, RequestDelegate next)
    {
        var token = http.Request.Headers[TokenHeader].ToString();
        if (token.Length > 0)
            http.Items[ItemKey] = await http
                .RequestServices.GetRequiredService<UploadLinkService>()
                .PassOfAsync(token, http.RequestAborted);

        await next(http);
    }

    public static UploadLinkPass? Of(HttpContext http) => http.Items[ItemKey] as UploadLinkPass;
}
