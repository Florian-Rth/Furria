using Furria.Core.Media;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class MediaJobConfiguration : IEntityTypeConfiguration<MediaJob>
{
    public void Configure(EntityTypeBuilder<MediaJob> builder)
    {
        builder.ToTable(
            "media_job",
            table =>
            {
                table.HasCheckConstraint("ck_media_job_attempts", "attempts >= 0");
                table.HasCheckConstraint(
                    "ck_media_job_lease",
                    """
                    (claimed_at IS NULL AND lease_id IS NULL AND lease_expires_at IS NULL)
                    OR (claimed_at IS NOT NULL AND lease_id IS NOT NULL AND lease_expires_at IS NOT NULL)
                    """
                );
            }
        );
        builder.HasKey(job => job.Id);

        builder
            .HasOne(job => job.MediaItem)
            .WithMany()
            .HasForeignKey(job => job.MediaItemId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(job => job.MediaItemId);
        builder.HasIndex(job => new { job.AvailableAt, job.Id });
    }
}
