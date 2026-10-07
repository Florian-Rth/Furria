using Furria.Application.Management;

namespace Furria.Application.Start;

public sealed record StartCandidates
{
    public required IReadOnlyList<StartEntrySummary> Entries { get; init; }

    public required IReadOnlyList<StartAnnouncementSummary> Announcements { get; init; }

    public required IReadOnlyList<ToDoSummary> ToDos { get; init; }

    public required IReadOnlyList<StartMineSummary> Mine { get; init; }

    public required IReadOnlyList<StartGroupMoment> GroupMoments { get; init; }

    public static StartCandidates OnlyToDos(IReadOnlyList<ToDoSummary> toDos) =>
        new()
        {
            Entries = [],
            Announcements = [],
            ToDos = toDos,
            Mine = [],
            GroupMoments = [],
        };
}
