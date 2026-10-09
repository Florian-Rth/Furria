using Furria.Application.Management;

namespace Furria.Application.Start;

public sealed record StartPanel
{
    public required StartPanelKind Kind { get; init; }

    public required int ShownCount { get; init; }

    public required IReadOnlyList<StartEntrySummary>? Entries { get; init; }

    public required IReadOnlyList<StartAnnouncementSummary>? Announcements { get; init; }

    public required IReadOnlyList<StartMineSummary>? Mine { get; init; }

    public required IReadOnlyList<StartGroupMoment>? GroupMoments { get; init; }

    public required IReadOnlyList<ToDoSummary>? ToDos { get; init; }

    public required IReadOnlyList<StartAlbumSummary>? Albums { get; init; }
}
