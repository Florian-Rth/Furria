using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.Identity;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Invitations;

public sealed class GetBulkInvitationPreview
    : EndpointWithoutRequest<GetBulkInvitationPreviewResponse>
{
    private readonly InvitationRoundService _invitationRoundService;

    public GetBulkInvitationPreview(InvitationRoundService invitationRoundService)
    {
        _invitationRoundService = invitationRoundService;
    }

    public override void Configure()
    {
        Get("manage/invitations/preview");
        Definition.RequirePermission(FurriaPermissions.PersonsManage);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var preview = await _invitationRoundService.PreviewAsync(ct);

        await Send.OkAsync(ToResponse(preview), cancellation: ct);
    }

    private static GetBulkInvitationPreviewResponse ToResponse(
        InvitationRoundPreviewDetails preview
    ) =>
        new()
        {
            InviteCount = preview.InviteCount,
            RemindCount = preview.RemindCount,
            EligibleWithoutEmailCount = preview.EligibleWithoutEmailCount,
        };
}

public sealed record GetBulkInvitationPreviewResponse
{
    public required int InviteCount { get; init; }

    public required int RemindCount { get; init; }

    public required int EligibleWithoutEmailCount { get; init; }
}
