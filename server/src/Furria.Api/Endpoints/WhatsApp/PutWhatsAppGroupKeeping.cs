using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.WhatsApp;

namespace Furria.Api.Endpoints.WhatsApp;

public sealed class PutWhatsAppGroupKeeping : Endpoint<PutWhatsAppGroupKeepingRequest>
{
    private readonly WhatsAppGroupKeeping _keeping;

    public PutWhatsAppGroupKeeping(WhatsAppGroupKeeping keeping)
    {
        _keeping = keeping;
    }

    public override void Configure()
    {
        Put("system/whatsapp/group-keeping");
        Definition.RequirePermission(FurriaPermissions.SystemView);
    }

    public override async Task HandleAsync(PutWhatsAppGroupKeepingRequest req, CancellationToken ct)
    {
        var switched = await _keeping.SwitchAsync(req.KeepsMembers, ct);
        if (!switched.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(switched.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record PutWhatsAppGroupKeepingRequest
{
    public required bool KeepsMembers { get; init; }
}

public sealed class PutWhatsAppGroupKeepingValidator : Validator<PutWhatsAppGroupKeepingRequest>;
