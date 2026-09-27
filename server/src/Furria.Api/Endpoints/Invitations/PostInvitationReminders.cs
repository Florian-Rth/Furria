using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Identity;
using Furria.Infrastructure.Identity;

namespace Furria.Api.Endpoints.Invitations;

public sealed class PostInvitationReminders
    : EndpointWithoutRequest<PostInvitationRemindersResponse>
{
    private readonly InvitationRoundService _invitationRoundService;

    public PostInvitationReminders(InvitationRoundService invitationRoundService)
    {
        _invitationRoundService = invitationRoundService;
    }

    public override void Configure()
    {
        Post("manage/invitations/reminders");
        Definition.RequirePermission(FurriaPermissions.PersonsManage);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        if (User.PersonId() is not { } issuerPersonId)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var sent = await _invitationRoundService.RemindAllAsync(issuerPersonId, ct);
        if (!sent.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(sent.Error, ct);
            return;
        }

        await Send.OkAsync(ToResponse(sent.Value), cancellation: ct);
    }

    private static PostInvitationRemindersResponse ToResponse(InvitationRoundDetails round) =>
        new() { SentCount = round.SentCount };
}

public sealed record PostInvitationRemindersResponse
{
    public required int SentCount { get; init; }
}
