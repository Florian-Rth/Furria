using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.WhatsApp;

namespace Furria.Api.Endpoints.WhatsApp;

public sealed class GetWhatsAppQrCode : EndpointWithoutRequest<GetWhatsAppQrCodeResponse>
{
    private readonly WhatsAppConnectionService _connection;

    public GetWhatsAppQrCode(WhatsAppConnectionService connection)
    {
        _connection = connection;
    }

    public override void Configure()
    {
        Get("system/whatsapp/qr-code");
        Definition.RequirePermission(FurriaPermissions.SystemView);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var qrCode = await _connection.QrCodeAsync(ct);
        if (!qrCode.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(qrCode.Error, ct);
            return;
        }

        HttpContext.Response.Headers.CacheControl = "no-store";
        await Send.OkAsync(
            new GetWhatsAppQrCodeResponse { Value = qrCode.Value },
            cancellation: ct
        );
    }
}

public sealed record GetWhatsAppQrCodeResponse
{
    public required string Value { get; init; }
}
