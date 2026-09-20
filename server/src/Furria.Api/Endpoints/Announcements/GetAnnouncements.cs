using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Announcements;

public sealed class GetAnnouncements : EndpointWithoutRequest<GetAnnouncementsResponse>
{
    private readonly AnnouncementService _announcementService;
    private readonly PermissionAuthorizer _authorizer;

    public GetAnnouncements(
        AnnouncementService announcementService,
        PermissionAuthorizer authorizer
    )
    {
        _announcementService = announcementService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Get("announcements");
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

        var announcements = await _announcementService.GetAnnouncementsAsync(ct);
        var mayPost = await _authorizer.IsGrantedAsync(
            accountId.Value,
            FurriaPermissions.AnnouncementsPost,
            ct
        );

        await Send.OkAsync(ToResponse(announcements, User.PersonId(), mayPost), cancellation: ct);
    }

    private static GetAnnouncementsResponse ToResponse(
        IReadOnlyList<AnnouncementSummary> announcements,
        int? viewerPersonId,
        bool viewerMayPost
    ) =>
        new()
        {
            Announcements =
            [
                .. announcements.Select(announcement =>
                    ToDto(announcement, viewerPersonId, viewerMayPost)
                ),
            ],
        };

    private static AnnouncementDto ToDto(
        AnnouncementSummary announcement,
        int? viewerPersonId,
        bool viewerMayPost
    ) =>
        new()
        {
            AnnouncementId = announcement.AnnouncementId,
            Title = announcement.Title,
            Body = announcement.Body,
            PublishedAt = announcement.PublishedAt,
            ValidUntil = announcement.ValidUntil,
            Author = ToDto(announcement.Author),
            ViewerMayEdit = viewerMayPost || announcement.Author.PersonId == viewerPersonId,
        };

    private static AnnouncementAuthorDto ToDto(AnnouncementAuthorReference author) =>
        new()
        {
            PersonId = author.PersonId,
            FirstName = author.FirstName,
            LastName = author.LastName,
            PortraitUrl = author.PortraitUrl,
            OfficeName = author.OfficeName,
        };
}

public sealed record GetAnnouncementsResponse
{
    public required IReadOnlyList<AnnouncementDto> Announcements { get; init; }
}

public sealed record AnnouncementDto
{
    public required int AnnouncementId { get; init; }

    public required string Title { get; init; }

    public required string Body { get; init; }

    public required DateTimeOffset PublishedAt { get; init; }

    public required DateOnly? ValidUntil { get; init; }

    public required AnnouncementAuthorDto Author { get; init; }

    public required bool ViewerMayEdit { get; init; }
}

public sealed record AnnouncementAuthorDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required string? PortraitUrl { get; init; }

    public required string? OfficeName { get; init; }
}
