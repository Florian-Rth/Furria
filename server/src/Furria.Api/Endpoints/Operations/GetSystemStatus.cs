using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Application.Operations;
using Furria.Core.Media;
using Furria.Infrastructure.Operations;

namespace Furria.Api.Endpoints.Operations;

public sealed class GetSystemStatus : EndpointWithoutRequest<GetSystemStatusResponse>
{
    private readonly SystemStatusService _systemStatusService;

    public GetSystemStatus(SystemStatusService systemStatusService)
    {
        _systemStatusService = systemStatusService;
    }

    public override void Configure()
    {
        Get("system/status");
        Definition.RequirePermission(FurriaPermissions.SystemView);
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var status = await _systemStatusService.StatusAsync(ct);

        await Send.OkAsync(ToResponse(status), cancellation: ct);
    }

    private static GetSystemStatusResponse ToResponse(SystemStatusDetails status) =>
        new()
        {
            CheckedAt = status.Facts.CheckedAt,
            Verdict = ToDto(status.Verdict),
            App = ToDto(status.Facts.App),
            Database = ToDto(status.Facts.Database),
            Storage = ToDto(status.Facts.Storage),
            Media = ToDto(status.Facts.Media),
            Queue = ToDto(status.Facts.Queue),
            Workers = [.. status.Facts.Workers.Select(ToDto)],
            Services = [.. status.Facts.Services.Select(ToDto)],
            Mail = ToDto(status.Facts.Mail),
            ErrorsPerHour = status.Facts.ErrorsPerHour,
            LogsSince = status.Facts.LogsSince,
        };

    private static SystemVerdictDto ToDto(SystemVerdictDetails verdict) =>
        new() { Level = verdict.Level, Reasons = [.. verdict.Reasons.Select(ToDto)] };

    private static SystemReasonDto ToDto(SystemReason reason) =>
        new()
        {
            Check = reason.Check,
            Level = reason.Level,
            Code = reason.Code,
            Value = reason.Value,
            Subject = reason.Subject,
        };

    private static SystemAppDto ToDto(SystemAppDetails app) =>
        new()
        {
            Version = app.Version,
            Environment = app.Environment,
            StartedAt = app.StartedAt,
        };

    private static SystemDatabaseDto ToDto(SystemDatabaseDetails database) =>
        new()
        {
            IsReachable = database.IsReachable,
            LatencyMs = database.LatencyMs,
            Version = database.Version,
            SizeBytes = database.SizeBytes,
            Connections = database.Connections,
            MaxConnections = database.MaxConnections,
            LastMigration = database.LastMigration,
            PendingMigrations = database.PendingMigrations,
            Tables = [.. database.Tables.Select(ToDto)],
        };

    private static SystemTableDto ToDto(DatabaseTableSummary table) =>
        new()
        {
            Name = table.Name,
            SizeBytes = table.SizeBytes,
            RowEstimate = table.RowEstimate,
        };

    private static SystemStorageDto ToDto(SystemStorageDetails storage) =>
        new()
        {
            Volume = storage.Volume is { } volume
                ? new SystemVolumeDto
                {
                    FreeBytes = volume.FreeBytes,
                    TotalBytes = volume.TotalBytes,
                }
                : null,
            Survey = storage.Survey is { } survey ? ToDto(survey) : null,
        };

    private static SystemStorageSurveyDto ToDto(StorageSurveyDetails survey) =>
        new()
        {
            MeasuredAt = survey.MeasuredAt,
            CadenceSeconds = survey.CadenceSeconds,
            Originals = ToDto(survey.Originals),
            Renditions = ToDto(survey.Renditions),
            Staging = ToDto(survey.Staging),
        };

    private static SystemStorageTallyDto ToDto(StorageTally tally) =>
        new() { Bytes = tally.Bytes, Files = tally.Files };

    private static SystemMediaDto ToDto(SystemMediaDetails media) =>
        new()
        {
            Counts = [.. media.Counts.Select(ToDto)],
            TotalBytes = media.TotalBytes,
            Failed = [.. media.Failed.Select(ToDto)],
        };

    private static SystemMediaCountDto ToDto(MediaCountSummary count) =>
        new()
        {
            Kind = count.Kind,
            State = count.State,
            Count = count.Count,
        };

    private static SystemFailedMediaDto ToDto(FailedMediaSummary failed) =>
        new()
        {
            MediaItemId = failed.MediaItemId,
            OwnerKind = failed.OwnerKind,
            FileName = failed.FileName,
            Reason = failed.Reason,
            FailedAt = failed.FailedAt,
        };

    private static SystemQueueDto ToDto(MediaQueueDetails queue) =>
        new()
        {
            Queued = queue.Queued,
            Running = queue.Running,
            Retrying = queue.Retrying,
            OldestQueuedAt = queue.OldestQueuedAt,
        };

    private static SystemWorkerDto ToDto(MediaWorkerSummary worker) =>
        new()
        {
            InstanceId = worker.InstanceId,
            HostName = worker.HostName,
            Version = worker.Version,
            HardwareAcceleration = worker.HardwareAcceleration,
            StartedAt = worker.StartedAt,
            LastSeenAt = worker.LastSeenAt,
            IsAlive = worker.IsAlive,
            PhotoMediaItemId = worker.PhotoMediaItemId,
            VideoMediaItemId = worker.VideoMediaItemId,
            AudioMediaItemId = worker.AudioMediaItemId,
        };

    private static SystemServiceDto ToDto(BackgroundRunSummary run) =>
        new()
        {
            Job = run.Job,
            CadenceSeconds = run.CadenceSeconds,
            LastRunAt = run.LastRunAt,
            LastFailure = run.LastFailure,
            ConsecutiveFailures = run.ConsecutiveFailures,
            NextDueAt = run.NextDueAt,
        };

    private static SystemMailDto ToDto(MailOutboxDetails mail) =>
        new()
        {
            Pending = mail.Pending,
            Retrying = mail.Retrying,
            OldestPendingAt = mail.OldestPendingAt,
        };
}

public sealed record GetSystemStatusResponse
{
    public required DateTimeOffset CheckedAt { get; init; }

    public required SystemVerdictDto Verdict { get; init; }

    public required SystemAppDto App { get; init; }

    public required SystemDatabaseDto Database { get; init; }

    public required SystemStorageDto Storage { get; init; }

    public required SystemMediaDto Media { get; init; }

    public required SystemQueueDto Queue { get; init; }

    public required IReadOnlyList<SystemWorkerDto> Workers { get; init; }

    public required IReadOnlyList<SystemServiceDto> Services { get; init; }

    public required SystemMailDto Mail { get; init; }

    public required IReadOnlyList<int> ErrorsPerHour { get; init; }

    public required DateTimeOffset? LogsSince { get; init; }
}

public sealed record SystemVerdictDto
{
    public required SystemLevel Level { get; init; }

    public required IReadOnlyList<SystemReasonDto> Reasons { get; init; }
}

public sealed record SystemReasonDto
{
    public required SystemCheck Check { get; init; }

    public required SystemLevel Level { get; init; }

    public required SystemReasonCode Code { get; init; }

    public required double? Value { get; init; }

    public required string? Subject { get; init; }
}

public sealed record SystemAppDto
{
    public required string Version { get; init; }

    public required string Environment { get; init; }

    public required DateTimeOffset StartedAt { get; init; }
}

public sealed record SystemDatabaseDto
{
    public required bool IsReachable { get; init; }

    public required int? LatencyMs { get; init; }

    public required string? Version { get; init; }

    public required long? SizeBytes { get; init; }

    public required int? Connections { get; init; }

    public required int? MaxConnections { get; init; }

    public required string? LastMigration { get; init; }

    public required int? PendingMigrations { get; init; }

    public required IReadOnlyList<SystemTableDto> Tables { get; init; }
}

public sealed record SystemTableDto
{
    public required string Name { get; init; }

    public required long SizeBytes { get; init; }

    public required long RowEstimate { get; init; }
}

public sealed record SystemStorageDto
{
    public required SystemVolumeDto? Volume { get; init; }

    public required SystemStorageSurveyDto? Survey { get; init; }
}

public sealed record SystemVolumeDto
{
    public required long FreeBytes { get; init; }

    public required long TotalBytes { get; init; }
}

public sealed record SystemStorageSurveyDto
{
    public required DateTimeOffset MeasuredAt { get; init; }

    public required int CadenceSeconds { get; init; }

    public required SystemStorageTallyDto Originals { get; init; }

    public required SystemStorageTallyDto Renditions { get; init; }

    public required SystemStorageTallyDto Staging { get; init; }
}

public sealed record SystemStorageTallyDto
{
    public required long Bytes { get; init; }

    public required int Files { get; init; }
}

public sealed record SystemMediaDto
{
    public required IReadOnlyList<SystemMediaCountDto> Counts { get; init; }

    public required long TotalBytes { get; init; }

    public required IReadOnlyList<SystemFailedMediaDto> Failed { get; init; }
}

public sealed record SystemMediaCountDto
{
    public required MediaKind Kind { get; init; }

    public required MediaItemState State { get; init; }

    public required int Count { get; init; }
}

public sealed record SystemFailedMediaDto
{
    public required int MediaItemId { get; init; }

    public required MediaOwnerKind OwnerKind { get; init; }

    public required string FileName { get; init; }

    public required string Reason { get; init; }

    public required DateTimeOffset FailedAt { get; init; }
}

public sealed record SystemQueueDto
{
    public required int Queued { get; init; }

    public required int Running { get; init; }

    public required int Retrying { get; init; }

    public required DateTimeOffset? OldestQueuedAt { get; init; }
}

public sealed record SystemWorkerDto
{
    public required Guid InstanceId { get; init; }

    public required string HostName { get; init; }

    public required string Version { get; init; }

    public required string HardwareAcceleration { get; init; }

    public required DateTimeOffset StartedAt { get; init; }

    public required DateTimeOffset LastSeenAt { get; init; }

    public required bool IsAlive { get; init; }

    public required int? PhotoMediaItemId { get; init; }

    public required int? VideoMediaItemId { get; init; }

    public required int? AudioMediaItemId { get; init; }
}

public sealed record SystemServiceDto
{
    public required BackgroundJob Job { get; init; }

    public required int? CadenceSeconds { get; init; }

    public required DateTimeOffset? LastRunAt { get; init; }

    public required string? LastFailure { get; init; }

    public required int ConsecutiveFailures { get; init; }

    public required DateTimeOffset? NextDueAt { get; init; }
}

public sealed record SystemMailDto
{
    public required int Pending { get; init; }

    public required int Retrying { get; init; }

    public required DateTimeOffset? OldestPendingAt { get; init; }
}
