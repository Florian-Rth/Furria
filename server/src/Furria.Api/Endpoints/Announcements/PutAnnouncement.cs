using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Announcements;

public sealed class PutAnnouncement : Endpoint<PutAnnouncementRequest>
{
    private readonly AnnouncementService _announcementService;
    private readonly PermissionAuthorizer _authorizer;

    public PutAnnouncement(AnnouncementService announcementService, PermissionAuthorizer authorizer)
    {
        _announcementService = announcementService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Put("announcements/{announcementId}");
    }

    public override async Task HandleAsync(PutAnnouncementRequest req, CancellationToken ct)
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

        var result = await _announcementService.UpdateAsync(
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

    private static UpdateAnnouncementCommand ToCommand(
        PutAnnouncementRequest req,
        int actorPersonId,
        bool actorMayPostAnnouncements
    ) =>
        new()
        {
            AnnouncementId = req.AnnouncementId,
            Title = req.Title,
            Body = req.Body,
            ValidUntil = req.ValidUntil,
            ActorPersonId = actorPersonId,
            ActorMayPostAnnouncements = actorMayPostAnnouncements,
        };
}

public sealed record PutAnnouncementRequest
{
    [RouteParam]
    public required int AnnouncementId { get; init; }

    public required string Title { get; init; }

    public required string Body { get; init; }

    public required DateOnly? ValidUntil { get; init; }
}

public sealed class PutAnnouncementValidator : Validator<PutAnnouncementRequest>
{
    public PutAnnouncementValidator()
    {
        RuleFor(request => request.AnnouncementId).GreaterThan(0);
        RuleFor(request => request.Title).NotEmpty().MaximumLength(AnnouncementLimits.TitleLength);
        RuleFor(request => request.Body).NotEmpty().MaximumLength(AnnouncementLimits.BodyLength);
    }
}
