using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Announcements;

public sealed class WithdrawAnnouncement : Endpoint<WithdrawAnnouncementRequest>
{
    private readonly AnnouncementService _announcementService;
    private readonly PermissionAuthorizer _authorizer;

    public WithdrawAnnouncement(
        AnnouncementService announcementService,
        PermissionAuthorizer authorizer
    )
    {
        _announcementService = announcementService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Post("announcements/{announcementId}/withdraw");
    }

    public override async Task HandleAsync(WithdrawAnnouncementRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        var personId = User.PersonId();
        if (accountId is null || personId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var mayPost = await _authorizer.IsGrantedAsync(
            accountId.Value,
            FurriaPermissions.AnnouncementsPost,
            ct
        );

        var result = await _announcementService.WithdrawAsync(
            ToCommand(req, personId.Value, mayPost),
            ct
        );

        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }

    private static WithdrawAnnouncementCommand ToCommand(
        WithdrawAnnouncementRequest req,
        int actorPersonId,
        bool actorMayPostAnnouncements
    ) =>
        new()
        {
            AnnouncementId = req.AnnouncementId,
            ActorPersonId = actorPersonId,
            ActorMayPostAnnouncements = actorMayPostAnnouncements,
        };
}

public sealed record WithdrawAnnouncementRequest
{
    [RouteParam]
    public required int AnnouncementId { get; init; }
}

public sealed class WithdrawAnnouncementValidator : Validator<WithdrawAnnouncementRequest>
{
    public WithdrawAnnouncementValidator()
    {
        RuleFor(request => request.AnnouncementId).GreaterThan(0);
    }
}
