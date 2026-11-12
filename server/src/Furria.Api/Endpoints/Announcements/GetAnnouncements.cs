using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Api.Endpoints.Calendar;
using Furria.Api.Media;
using Furria.Api.Mentions;
using Furria.Application.Authorization;
using Furria.Application.Club;
using Furria.Core.Club;
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

        var mentionReader = await MentionReaders.OfAsync(
            _authorizer,
            accountId.Value,
            User.PersonId(),
            ct
        );
        var mayPost = await _authorizer.IsGrantedAsync(
            accountId.Value,
            FurriaPermissions.AnnouncementsPost,
            ct
        );
        var announcements = await _announcementService.GetAnnouncementsAsync(
            new AnnouncementReader(mentionReader, mayPost),
            ct
        );

        await Send.OkAsync(ToResponse(announcements), cancellation: ct);
    }

    private static GetAnnouncementsResponse ToResponse(
        IReadOnlyList<AnnouncementSummary> announcements
    ) => new() { Announcements = [.. announcements.Select(ToDto)] };

    private static AnnouncementDto ToDto(AnnouncementSummary announcement) =>
        new()
        {
            AnnouncementId = announcement.AnnouncementId,
            Title = announcement.Title,
            Body = announcement.Body,
            Mentions = AnnouncementMentionsDto.From(announcement.Mentions),
            PublishedAt = announcement.PublishedAt,
            ValidUntil = announcement.ValidUntil,
            Author = announcement.Author is { } author ? ToDto(author) : null,
            ViewerMayEdit = announcement.ViewerManages,
            AddOns = [.. announcement.AddOns.Select(AnnouncementAddOnDto.From)],
            AnswerCount = announcement.AnswerCount,
            ViewerAnswer = announcement.ViewerAnswer,
            ViewerMayAnswer = announcement.ViewerMayAnswer,
        };

    private static AnnouncementAuthorDto ToDto(AnnouncementAuthorReference author) =>
        new()
        {
            PersonId = author.PersonId,
            FirstName = author.FirstName,
            LastName = author.LastName,
            Portrait = PictureDto.From(author.Portrait),
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

    public required AnnouncementMentionsDto Mentions { get; init; }

    public required DateTimeOffset PublishedAt { get; init; }

    public required DateOnly? ValidUntil { get; init; }

    public required AnnouncementAuthorDto? Author { get; init; }

    public required bool ViewerMayEdit { get; init; }

    public required IReadOnlyList<AnnouncementAddOnDto> AddOns { get; init; }

    public required int AnswerCount { get; init; }

    public required AttendanceAnswer? ViewerAnswer { get; init; }

    public required bool ViewerMayAnswer { get; init; }
}

public sealed record AnnouncementAddOnDto
{
    public required AnnouncementAddOnKind Kind { get; init; }

    public required AnnouncementAttendanceDto? Attendance { get; init; }

    public required CalendarPollDto? Poll { get; init; }

    public required CalendarSignUpListDto? SignUpList { get; init; }

    public static AnnouncementAddOnDto From(AnnouncementAddOnDetails addOn) =>
        new()
        {
            Kind = addOn.Kind,
            Attendance = addOn.Attendance is { } attendance
                ? AnnouncementAttendanceDto.From(attendance)
                : null,
            Poll = addOn.Poll is { } poll ? CalendarPollDto.From(poll) : null,
            SignUpList = addOn.SignUpList is { } list ? CalendarSignUpListDto.From(list) : null,
        };
}

public sealed record AnnouncementAttendanceDto
{
    public required DateTimeOffset? AnswersUntil { get; init; }

    public required DateTimeOffset? ClosedAt { get; init; }

    public required string? ClosedByFirstName { get; init; }

    public required string? ClosedByLastName { get; init; }

    public required bool IsClosed { get; init; }

    public required int Yes { get; init; }

    public required int Maybe { get; init; }

    public required int No { get; init; }

    public required int ConcernedCount { get; init; }

    public required IReadOnlyList<CalendarAttendanceAnswerDto> Answers { get; init; }

    public required IReadOnlyList<CalendarAttendancePersonDto>? NotAnswered { get; init; }

    public required CalendarReminderDto? Reminder { get; init; }

    public static AnnouncementAttendanceDto From(AnnouncementAttendanceDetails attendance) =>
        new()
        {
            AnswersUntil = attendance.AnswersUntil,
            ClosedAt = attendance.ClosedAt,
            ClosedByFirstName = attendance.ClosedBy?.FirstName,
            ClosedByLastName = attendance.ClosedBy?.LastName,
            IsClosed = attendance.IsClosed,
            Yes = attendance.Yes,
            Maybe = attendance.Maybe,
            No = attendance.No,
            ConcernedCount = attendance.ConcernedCount,
            Answers = [.. attendance.Answers.Select(CalendarAttendanceAnswerDto.From)],
            NotAnswered = attendance.NotAnswered is { } missing
                ? [.. missing.Select(CalendarAttendancePersonDto.From)]
                : null,
            Reminder = CalendarReminderDto.From(attendance.Reminder),
        };
}

public sealed record AnnouncementAuthorDto
{
    public required int PersonId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required PictureDto? Portrait { get; init; }

    public required string? OfficeName { get; init; }
}
