using Furria.Core.Studio;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class ActVideoConfiguration : IEntityTypeConfiguration<ActVideo>
{
    public void Configure(EntityTypeBuilder<ActVideo> builder)
    {
        builder.ToTable(
            "act_video",
            table =>
                table.HasCheckConstraint(
                    "ck_act_video_start",
                    "(start_source_media_item_id IS NULL) = (start_seconds IS NULL) AND (start_seconds IS NULL OR start_seconds >= 0) AND start_video_seconds >= 0"
                )
        );
        builder.HasKey(video => video.Id);

        builder.Property(video => video.Name).HasMaxLength(ActVideo.NameLength);

        builder
            .HasOne(video => video.Act)
            .WithMany()
            .HasForeignKey(video => video.ActId)
            .HasConstraintName("fk_act_video_act_act_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(video => video.ActId).HasDatabaseName("ix_act_video_act_id");

        builder
            .HasOne(video => video.MediaItem)
            .WithMany()
            .HasForeignKey(video => video.MediaItemId)
            .HasConstraintName("fk_act_video_media_item_media_item_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasIndex(video => video.MediaItemId)
            .HasDatabaseName("ix_act_video_media_item_id")
            .IsUnique();

        builder
            .HasOne(video => video.StartSource)
            .WithMany()
            .HasForeignKey(video => video.StartSourceMediaItemId)
            .HasConstraintName("fk_act_video_media_item_start_source_media_item_id")
            .OnDelete(DeleteBehavior.SetNull);
        builder
            .HasIndex(video => video.StartSourceMediaItemId)
            .HasDatabaseName("ix_act_video_start_source_media_item_id");
    }
}
