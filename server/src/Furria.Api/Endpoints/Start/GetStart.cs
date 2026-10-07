using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Management;
using Furria.Application.Start;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.Start;

namespace Furria.Api.Endpoints.Start;

public sealed class GetStart : EndpointWithoutRequest<GetStartResponse>
{
    private readonly StartService _startService;
    private readonly PermissionAuthorizer _authorizer;

    public GetStart(StartService startService, PermissionAuthorizer authorizer)
    {
        _startService = startService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Get("start");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var personId = await _authorizer.ActivePersonIdAsync(accountId.Value, ct);
        if (personId is null && !await _authorizer.IsManagingLoginAsync(accountId.Value, ct))
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        var start = await _startService.GetAsync(accountId.Value, personId, ct);

        await Send.OkAsync(ToResponse(start), cancellation: ct);
    }

    private static GetStartResponse ToResponse(StartDetails start) =>
        new()
        {
            AsOf = start.AsOf,
            Today = start.Today,
            ReshapeAt = start.ReshapeAt,
            ViewerIsActiveInClub = start.ViewerIsActiveInClub,
            Panels = [.. start.Panels.Select(ToDto)],
        };

    private static StartPanelDto ToDto(StartPanel panel) =>
        new()
        {
            Kind = panel.Kind,
            ShownCount = panel.ShownCount,
            Entries = panel.Entries?.Select(ToDto).ToList(),
            Announcements = panel.Announcements?.Select(ToDto).ToList(),
            Mine = panel.Mine?.Select(ToDto).ToList(),
            GroupMoments = panel.GroupMoments?.Select(ToDto).ToList(),
            ToDos = panel.ToDos?.Select(ToDto).ToList(),
        };

    private static StartEntryDto ToDto(StartEntrySummary entry) =>
        new()
        {
            CalendarEntryId = entry.CalendarEntryId,
            Title = entry.Title,
            Kind = entry.Kind,
            StartsAt = entry.StartsAt,
            EndsAt = entry.EndsAt,
            IsRunning = entry.IsRunning,
            Venue = entry.Venue is null ? null : ToDto(entry.Venue),
            ViewerHoldsVenueKey = entry.ViewerHoldsVenueKey,
            OwnerGroup = entry.OwnerGroup is null ? null : ToDto(entry.OwnerGroup),
            ParticipatingGroups = [.. entry.ParticipatingGroups.Select(ToDto)],
            ViewerGroupIds = entry.ViewerGroupIds,
            ViewerRuns = entry.ViewerRuns is null ? null : ToDto(entry.ViewerRuns),
            Attendance = entry.Attendance is null ? null : ToDto(entry.Attendance),
            Description = entry.Description,
        };

    private static StartVenueDto ToDto(StartVenue venue) =>
        new()
        {
            VenueId = venue.VenueId,
            Name = venue.Name,
            Street = venue.Street,
            Zip = venue.Zip,
            City = venue.City,
            Hint = venue.Hint,
        };

    private static StartGroupRefDto ToDto(StartGroupRef group) =>
        new()
        {
            GroupId = group.GroupId,
            Name = group.Name,
            Tone = group.Tone,
        };

    private static StartRunDto ToDto(StartRun run) =>
        new() { GroupId = run.GroupId, Function = run.Function };

    private static StartAttendanceDto ToDto(StartAttendance attendance) =>
        new() { ViewerAnswer = attendance.ViewerAnswer, IsOwed = attendance.IsOwed };

    private static StartAnnouncementDto ToDto(StartAnnouncementSummary announcement) =>
        new()
        {
            AnnouncementId = announcement.AnnouncementId,
            Title = announcement.Title,
            Body = announcement.Body,
            PublishedAt = announcement.PublishedAt,
            ValidUntil = announcement.ValidUntil,
            Author = announcement.Author is { } author ? ToDto(author) : null,
        };

    private static StartPersonDto ToDto(StartPerson person) =>
        new()
        {
            PersonId = person.PersonId,
            FirstName = person.FirstName,
            LastName = person.LastName,
            PortraitUrl = person.PortraitUrl,
            OfficeName = person.OfficeName,
        };

    private static StartMineDto ToDto(StartMineSummary item) =>
        new()
        {
            Kind = item.Kind,
            SubjectId = item.SubjectId,
            On = item.On,
            Until = item.Until,
            Name = item.Name,
            GroupTone = item.GroupTone,
            Function = item.Function,
            ChangedBy = item.ChangedBy is null ? null : ToDto(item.ChangedBy),
            SessionStartYear = item.SessionStartYear,
            Years = item.Years,
            PermissionKeys = item.PermissionKeys,
        };

    private static StartPersonRefDto ToDto(StartPersonRef person) =>
        new()
        {
            PersonId = person.PersonId,
            FirstName = person.FirstName,
            LastName = person.LastName,
        };

    private static StartGroupMomentDto ToDto(StartGroupMoment moment) =>
        new()
        {
            Kind = moment.Kind,
            GroupId = moment.GroupId,
            Name = moment.Name,
            Tone = moment.Tone,
            Years = moment.Years,
            FoundedYear = moment.FoundedYear,
            Until = moment.Until,
        };

    private static StartToDoDto ToDto(ToDoSummary toDo) =>
        new() { Kind = toDo.Kind, Count = toDo.Count };
}

public sealed record GetStartResponse
{
    public required DateTimeOffset AsOf { get; init; }

    public required DateOnly Today { get; init; }

    public required DateTimeOffset? ReshapeAt { get; init; }

    public required bool ViewerIsActiveInClub { get; init; }

    public required IReadOnlyList<StartPanelDto> Panels { get; init; }
}

public sealed record StartPanelDto
{
    public required StartPanelKind Kind { get; init; }

    public required int ShownCount { get; init; }

    public required IReadOnlyList<StartEntryDto>? Entries { get; init; }

    public required IReadOnlyList<StartAnnouncementDto>? Announcements { get; init; }

    public required IReadOnlyList<StartMineDto>? Mine { get; init; }

    public required IReadOnlyList<StartGroupMomentDto>? GroupMoments { get; init; }

    public required IReadOnlyList<StartToDoDto>? ToDos { get; init; }
}

public sealed record StartEntryDto
{
    public required int CalendarEntryId { get; init; }

    public required string Title { get; init; }

    public required CalendarEntryKind Kind { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }

    public required bool IsRunning { get; init; }

    public required StartVenueDto? Venue { get; init; }

    public required bool ViewerHoldsVenueKey { get; init; }

    public required StartGroupRefDto? OwnerGroup { get; init; }

    public required IReadOnlyList<StartGroupRefDto> ParticipatingGroups { get; init; }

    public required IReadOnlyList<int> ViewerGroupIds { get; init; }

    public required StartRunDto? ViewerRuns { get; init; }

    public required StartAttendanceDto? Attendance { get; init; }

    public required string? Description { get; init; }
}

public sealed record StartVenueDto
{
    public required int VenueId { get; init; }

    public required string Name { get; init; }

    public required string? Street { get; init; }

    public required string? Zip { get; init; }

    public required string? City { get; init; }

    public required string? Hint { get; init; }
}

public sealed record StartGroupRefDto
{
    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required GroupTone? Tone { get; init; }
}

public sealed record StartRunDto
{
    public required int GroupId { get; init; }

    public required string? Function { get; init; }
}

public sealed record StartAttendanceDto
{
    public required AttendanceAnswer? ViewerAnswer { get; init; }

    public required bool IsOwed { get; init; }
}

public sealed record StartAnnouncementDto
{
    public required int AnnouncementId { get; init; }

    public required string Title { get; init; }

    public required string Body { get; init; }

    public required DateTimeOffset PublishedAt { get; init; }

    public required DateOnly? ValidUntil { get; init; }

    public required StartPersonDto? Author { get; init; }
}

public sealed record StartPersonDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required string? PortraitUrl { get; init; }

    public required string? OfficeName { get; init; }
}

public sealed record StartMineDto
{
    public required StartMineKind Kind { get; init; }

    public required int? SubjectId { get; init; }

    public required DateOnly On { get; init; }

    public required DateOnly Until { get; init; }

    public required string? Name { get; init; }

    public required GroupTone? GroupTone { get; init; }

    public required string? Function { get; init; }

    public required StartPersonRefDto? ChangedBy { get; init; }

    public required int? SessionStartYear { get; init; }

    public required int? Years { get; init; }

    public required IReadOnlyList<string>? PermissionKeys { get; init; }
}

public sealed record StartPersonRefDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }
}

public sealed record StartGroupMomentDto
{
    public required StartGroupMomentKind Kind { get; init; }

    public required int GroupId { get; init; }

    public required string Name { get; init; }

    public required GroupTone? Tone { get; init; }

    public required int Years { get; init; }

    public required int FoundedYear { get; init; }

    public required DateOnly Until { get; init; }
}

public sealed record StartToDoDto
{
    public required ToDoKind Kind { get; init; }

    public required int Count { get; init; }
}
