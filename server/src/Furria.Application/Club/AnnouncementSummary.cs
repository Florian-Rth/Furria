using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record AnnouncementSummary
{
    public required int AnnouncementId { get; init; }

    public required string Title { get; init; }

    public required string Body { get; init; }

    public required AnnouncementMentionTargets Mentions { get; init; }

    public required DateTimeOffset PublishedAt { get; init; }

    public required DateOnly? ValidUntil { get; init; }

    public required AnnouncementAuthorReference? Author { get; init; }

    public required IReadOnlyList<AnnouncementAddOnDetails> AddOns { get; init; }

    public required int AnswerCount { get; init; }

    public required AttendanceAnswer? ViewerAnswer { get; init; }

    public required bool ViewerMayAnswer { get; init; }

    public required bool ViewerManages { get; init; }
}
