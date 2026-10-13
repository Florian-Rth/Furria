using Furria.Infrastructure.Media;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class MediaWorkerHeartbeatConfiguration
    : IEntityTypeConfiguration<MediaWorkerHeartbeat>
{
    public void Configure(EntityTypeBuilder<MediaWorkerHeartbeat> builder)
    {
        builder.ToTable("media_worker_heartbeat");
        builder.HasKey(heartbeat => heartbeat.InstanceId);
        builder.Property(heartbeat => heartbeat.InstanceId).ValueGeneratedNever();
        builder
            .Property(heartbeat => heartbeat.HostName)
            .HasMaxLength(MediaWorkerHeartbeat.HostNameLength)
            .IsRequired();
        builder
            .Property(heartbeat => heartbeat.Version)
            .HasMaxLength(MediaWorkerHeartbeat.VersionLength)
            .IsRequired();
        builder
            .Property(heartbeat => heartbeat.HardwareAcceleration)
            .HasMaxLength(MediaWorkerHeartbeat.HardwareAccelerationLength)
            .IsRequired();
    }
}
