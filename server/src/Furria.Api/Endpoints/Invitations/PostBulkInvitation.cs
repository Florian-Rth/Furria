using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Identity;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Invitations;

public sealed class PostBulkInvitation : EndpointWithoutRequest<PostBulkInvitationResponse>
{
    private readonly InvitationRoundService _invitationRoundService;

    public PostBulkInvitation(InvitationRoundService invitationRoundService)
    {
        _invitationRoundService = invitationRoundService;
    }

    public override void Configure()
    {
        Post("manage/invitations/bulk");
        Definition.RequirePermission(FurriaPermissions.PersonsManage);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        if (User.PersonId() is not { } issuerPersonId)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var sent = await _invitationRoundService.InviteAllAsync(issuerPersonId, ct);
        if (!sent.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(sent.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(sent.Value), cancellation: ct);
    }

    private static PostBulkInvitationResponse ToResponse(InvitationRoundDetails round) =>
        new() { SentCount = round.SentCount };
}

public sealed record PostBulkInvitationResponse
{
    public required int SentCount { get; init; }
}
