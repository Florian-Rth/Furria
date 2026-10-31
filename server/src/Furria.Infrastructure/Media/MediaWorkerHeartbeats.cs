using System.Diagnostics.Contracts;
using Furria.Application.Operations;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Media;

public sealed class MediaWorkerHeartbeats
{
    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;

    public MediaWorkerHeartbeats(AppDbContext dbContext, TimeProvider timeProvider)
    {
        _dbContext = dbContext;
        _timeProvider = timeProvider;
    }

    public async Task BeatAsync(MediaWorkerBeatCommand command, CancellationToken ct)
    {
        var lastSeenAt = _timeProvider.GetUtcNow();
        var hostName = Truncated(command.HostName, MediaWorkerHeartbeat.HostNameLength);
        var version = Truncated(command.Version, MediaWorkerHeartbeat.VersionLength);
        var hardwareAcceleration = Truncated(
            command.HardwareAcceleration,
            MediaWorkerHeartbeat.HardwareAccelerationLength
        );
        await _dbContext.Database.ExecuteSqlAsync(
            $"""
            INSERT INTO media_worker_heartbeat (
                instance_id, host_name, version, hardware_acceleration,
                started_at, last_seen_at, photo_media_item_id, video_media_item_id,
                audio_media_item_id)
            VALUES (
                {command.InstanceId}, {hostName}, {version}, {hardwareAcceleration},
                {command.StartedAt}, {lastSeenAt}, {command.PhotoMediaItemId}, {command.VideoMediaItemId},
                {command.AudioMediaItemId})
            ON CONFLICT (instance_id) DO UPDATE SET
                host_name = EXCLUDED.host_name,
                version = EXCLUDED.version,
                hardware_acceleration = EXCLUDED.hardware_acceleration,
                last_seen_at = EXCLUDED.last_seen_at,
                photo_media_item_id = EXCLUDED.photo_media_item_id,
                video_media_item_id = EXCLUDED.video_media_item_id,
                audio_media_item_id = EXCLUDED.audio_media_item_id
            """,
            ct
        );
    }

    public Task RemoveAsync(Guid instanceId, CancellationToken ct) =>
        _dbContext
            .MediaWorkerHeartbeats.Where(heartbeat => heartbeat.InstanceId == instanceId)
            .ExecuteDeleteAsync(ct);

    [Pure]
    private static string Truncated(string text, int maxLength) =>
        text.Length <= maxLength ? text : text[..maxLength];
}
