namespace Furria.Application.Operations;

public sealed record SystemDatabaseDetails
{
    public static readonly SystemDatabaseDetails Unreachable = new()
    {
        IsReachable = false,
        LatencyMs = null,
        Version = null,
        SizeBytes = null,
        Connections = null,
        MaxConnections = null,
        LastMigration = null,
        PendingMigrations = null,
        Tables = [],
    };

    public required bool IsReachable { get; init; }

    public required int? LatencyMs { get; init; }

    public required string? Version { get; init; }

    public required long? SizeBytes { get; init; }

    public required int? Connections { get; init; }

    public required int? MaxConnections { get; init; }

    public required string? LastMigration { get; init; }

    public required int? PendingMigrations { get; init; }

    public required IReadOnlyList<DatabaseTableSummary> Tables { get; init; }
}
