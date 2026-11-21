using Furria.Application.Intakes;
using Furria.Infrastructure.Intakes;

namespace Furria.Api.Media;

public static class IntakeUploadPasses
{
    public const string TokenHeader = "Intake-Token";

    private const string ItemKey = "Furria.IntakeUploadPass";

    public static async Task CaptureAsync(HttpContext http, RequestDelegate next)
    {
        var token = http.Request.Headers[TokenHeader].ToString();
        if (token.Length > 0)
            http.Items[ItemKey] = await http
                .RequestServices.GetRequiredService<IntakeService>()
                .PortraitPassOfAsync(token, http.RequestAborted);

        await next(http);
    }

    public static IntakePortraitPass? Of(HttpContext http) =>
        http.Items[ItemKey] as IntakePortraitPass;
}
