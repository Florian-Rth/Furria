using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.WhatsApp;

namespace Furria.Api.Endpoints.WhatsApp;

public sealed class PostWhatsAppSession : EndpointWithoutRequest
{
    private readonly WhatsAppConnectionService _connection;

    public PostWhatsAppSession(WhatsAppConnectionService connection)
    {
        _connection = connection;
    }

    public override void Configure()
    {
        Post("system/whatsapp/session");
        Definition.RequirePermission(FurriaPermissions.SystemView);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var started = await _connection.StartLinkingAsync(ct);
        if (!started.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(started.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}
