namespace Furria.Application.Operations;

public sealed record SystemFacts
{
    public const int ErrorHours = 24;

    public required DateTimeOffset CheckedAt { get; init; }

    public required SystemAppDetails App { get; init; }

    public required SystemDatabaseDetails Database { get; init; }

    public required SystemStorageDetails Storage { get; init; }

    public required SystemMediaDetails Media { get; init; }

    public required MediaQueueDetails Queue { get; init; }

    public required IReadOnlyList<MediaWorkerSummary> Workers { get; init; }

    public required IReadOnlyList<BackgroundRunSummary> Services { get; init; }

    public required MailOutboxDetails Mail { get; init; }

    public required IReadOnlyList<int> ErrorsPerHour { get; init; }

    public required DateTimeOffset? LogsSince { get; init; }
}
