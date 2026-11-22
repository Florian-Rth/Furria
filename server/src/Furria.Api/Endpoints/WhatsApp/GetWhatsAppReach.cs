using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Infrastructure.WhatsApp;

namespace Furria.Api.Endpoints.WhatsApp;

public sealed class GetWhatsAppReach : EndpointWithoutRequest<GetWhatsAppReachResponse>
{
    private readonly WhatsAppGroupService _groups;

    public GetWhatsAppReach(WhatsAppGroupService groups)
    {
        _groups = groups;
    }

    public override void Configure()
    {
        Get("whatsapp/reach");
        Definition.RequireAffiliation();
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var clubGroup = await _groups.ReachesClubGroupAsync(ct);

        await Send.OkAsync(new() { ClubGroup = clubGroup }, cancellation: ct);
    }
}

public sealed record GetWhatsAppReachResponse
{
    public required bool ClubGroup { get; init; }
}
