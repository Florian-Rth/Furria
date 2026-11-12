namespace Furria.Application.Start;

public sealed record StartAnnouncementAddOns
{
    public required int AnnouncementId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset PublishedAt { get; init; }

    public required StartAnnouncementAttendance? Attendance { get; init; }

    public required IReadOnlyList<StartPoll> OpenPolls { get; init; }

    public required IReadOnlyList<StartSignUpList> OpenSignUpLists { get; init; }

    public bool IsOwed =>
        Attendance is { IsOwed: true }
        || OpenPolls.Any(poll => poll.IsOwed)
        || OpenSignUpLists.Any(list => list.IsOwed);
}
