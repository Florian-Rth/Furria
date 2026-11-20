using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Infrastructure.WhatsApp;

namespace Furria.Api.Endpoints.WhatsApp;

public sealed class PutWhatsAppClubGroup : Endpoint<PutWhatsAppClubGroupRequest>
{
    private readonly WhatsAppGroupService _groups;

    public PutWhatsAppClubGroup(WhatsAppGroupService groups)
    {
        _groups = groups;
    }

    public override void Configure()
    {
        Put("system/whatsapp/club-group");
        Definition.RequirePermission(FurriaPermissions.SystemView);
    }

    public override async Task HandleAsync(PutWhatsAppClubGroupRequest req, CancellationToken ct)
    {
        var picked = await _groups.PickClubGroupAsync(req.ChatId, ct);
        if (!picked.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(picked.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record PutWhatsAppClubGroupRequest
{
    public required string ChatId { get; init; }
}

public sealed class PutWhatsAppClubGroupValidator : Validator<PutWhatsAppClubGroupRequest>
{
    public PutWhatsAppClubGroupValidator()
    {
        RuleFor(request => request.ChatId)
            .NotEmpty()
            .MaximumLength(LinkedWhatsAppGroup.ChatIdLength);
    }
}
