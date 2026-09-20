namespace Furria.Application.Management;

public sealed record ManageHubSessions
{
    public required int EntryCount { get; init; }

    public required int CurrentStartYear { get; init; }

    public required bool HasCurrentEntry { get; init; }
}
