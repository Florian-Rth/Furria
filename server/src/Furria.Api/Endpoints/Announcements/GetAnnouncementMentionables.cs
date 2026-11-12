using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Mentions;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Announcements;

public sealed class GetAnnouncementMentionables
    : EndpointWithoutRequest<GetAnnouncementMentionablesResponse>
{
    private readonly AnnouncementService _announcementService;
    private readonly PermissionAuthorizer _authorizer;

    public GetAnnouncementMentionables(
        AnnouncementService announcementService,
        PermissionAuthorizer authorizer
    )
    {
        _announcementService = announcementService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Get("announcements/mentionables");
        Definition.RequirePermission(FurriaPermissions.ClubRead);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var reader = await MentionReaders.OfAsync(
            _authorizer,
            accountId.Value,
            User.PersonId(),
            ct
        );
        var mentionables = await _announcementService.GetMentionablesAsync(reader, ct);

        await Send.OkAsync(
            new GetAnnouncementMentionablesResponse
            {
                Mentionables = AnnouncementMentionsDto.From(mentionables),
            },
            cancellation: ct
        );
    }
}

public sealed record GetAnnouncementMentionablesResponse
{
    public required AnnouncementMentionsDto Mentionables { get; init; }
}
