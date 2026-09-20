using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Club;

namespace Furria.Api.Endpoints.Club;

public sealed class GetClubHub : EndpointWithoutRequest<GetClubHubResponse>
{
    private readonly ClubService _clubService;

    public GetClubHub(ClubService clubService)
    {
        _clubService = clubService;
    }

    public override void Configure()
    {
        Get("club/hub");
        Definition.RequirePermission(FurriaPermissions.ClubRead);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var hub = await _clubService.GetHubAsync(ct);

        await Send.OkAsync(ToResponse(hub), cancellation: ct);
    }

    private static GetClubHubResponse ToResponse(ClubHubDetails hub) =>
        new()
        {
            Session = ToDto(hub.Session),
            Stats = ToDto(hub.Stats),
            Announcements = ToDto(hub.Announcements),
            Calendar = [.. hub.Calendar.Select(ToDto)],
            Board = [.. hub.Board.Select(ToDto)],
            Venues = [.. hub.Venues.Select(ToDto)],
        };

    private static ClubSessionDto ToDto(ClubHubSession session) =>
        new()
        {
            StartYear = session.StartYear,
            Label = session.Label,
            Number = session.Number,
            Motto = session.Motto,
            SignetSvg = session.SignetSvg,
        };

    private static ClubStatsDto ToDto(ClubHubStats stats) =>
        new()
        {
            MemberCount = stats.MemberCount,
            GroupCount = stats.GroupCount,
            JoinedThisSessionCount = stats.JoinedThisSessionCount,
        };

    private static ClubAnnouncementsDto ToDto(ClubHubAnnouncements announcements) =>
        new()
        {
            Newest = [.. announcements.Newest.Select(ToDto)],
            TotalCount = announcements.TotalCount,
        };

    private static ClubAnnouncementDto ToDto(ClubHubAnnouncement announcement) =>
        new()
        {
            AnnouncementId = announcement.AnnouncementId,
            Title = announcement.Title,
            Body = announcement.Body,
            PublishedAt = announcement.PublishedAt,
            ValidUntil = announcement.ValidUntil,
            Author = ToDto(announcement.Author),
        };

    private static ClubPersonDto ToDto(ClubHubPerson person) =>
        new()
        {
            PersonId = person.PersonId,
            FirstName = person.FirstName,
            LastName = person.LastName,
            PortraitUrl = person.PortraitUrl,
            OfficeName = person.OfficeName,
        };

    private static ClubCalendarEntryDto ToDto(ClubHubCalendarEntry entry) =>
        new()
        {
            CalendarEntryId = entry.CalendarEntryId,
            Title = entry.Title,
            StartsAt = entry.StartsAt,
            EndsAt = entry.EndsAt,
            Kind = entry.Kind,
            VenueName = entry.VenueName,
            IsRunning = entry.IsRunning,
        };

    private static ClubBoardSeatDto ToDto(ClubHubBoardSeat seat) =>
        new()
        {
            Person = ToDto(seat.Person),
            OfficeName = seat.OfficeName,
            SortOrder = seat.SortOrder,
        };

    private static ClubVenueDto ToDto(ClubHubVenue venue) =>
        new()
        {
            VenueId = venue.VenueId,
            Name = venue.Name,
            SortOrder = venue.SortOrder,
            Holders = [.. venue.Holders.Select(ToDto)],
        };

    private static ClubKeyHolderDto ToDto(ClubHubKeyHolder holder) =>
        new() { Person = ToDto(holder.Person), SinceOn = holder.SinceOn };
}

public sealed record GetClubHubResponse
{
    public required ClubSessionDto Session { get; init; }

    public required ClubStatsDto Stats { get; init; }

    public required ClubAnnouncementsDto Announcements { get; init; }

    public required IReadOnlyList<ClubCalendarEntryDto> Calendar { get; init; }

    public required IReadOnlyList<ClubBoardSeatDto> Board { get; init; }

    public required IReadOnlyList<ClubVenueDto> Venues { get; init; }
}

public sealed record ClubSessionDto
{
    public required int StartYear { get; init; }

    public required string Label { get; init; }

    public required int? Number { get; init; }

    public required string? Motto { get; init; }

    public required string? SignetSvg { get; init; }
}

public sealed record ClubStatsDto
{
    public required int MemberCount { get; init; }

    public required int GroupCount { get; init; }

    public required int JoinedThisSessionCount { get; init; }
}

public sealed record ClubAnnouncementsDto
{
    public required IReadOnlyList<ClubAnnouncementDto> Newest { get; init; }

    public required int TotalCount { get; init; }
}

public sealed record ClubAnnouncementDto
{
    public required int AnnouncementId { get; init; }

    public required string Title { get; init; }

    public required string Body { get; init; }

    public required DateTimeOffset PublishedAt { get; init; }

    public required DateOnly? ValidUntil { get; init; }

    public required ClubPersonDto Author { get; init; }
}

public sealed record ClubPersonDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required string? PortraitUrl { get; init; }

    public required string? OfficeName { get; init; }
}

public sealed record ClubCalendarEntryDto
{
    public required int CalendarEntryId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }

    public required CalendarEntryKind Kind { get; init; }

    public required string? VenueName { get; init; }

    public required bool IsRunning { get; init; }
}

public sealed record ClubBoardSeatDto
{
    public required ClubPersonDto Person { get; init; }

    public required string OfficeName { get; init; }

    public required int SortOrder { get; init; }
}

public sealed record ClubVenueDto
{
    public required int VenueId { get; init; }

    public required string Name { get; init; }

    public required int SortOrder { get; init; }

    public required IReadOnlyList<ClubKeyHolderDto> Holders { get; init; }
}

public sealed record ClubKeyHolderDto
{
    public required ClubPersonDto Person { get; init; }

    public required DateOnly SinceOn { get; init; }
}
