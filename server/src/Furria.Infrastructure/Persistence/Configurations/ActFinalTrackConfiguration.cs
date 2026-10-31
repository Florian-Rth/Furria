using Furria.Core.Studio;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class ActFinalTrackConfiguration : IEntityTypeConfiguration<ActFinalTrack>
{
    public void Configure(EntityTypeBuilder<ActFinalTrack> builder)
    {
        builder.ToTable(
            "act_final_track",
            table =>
            {
                table.HasCheckConstraint("ck_act_final_track_version", "version >= 1");
                table.HasCheckConstraint(
                    "ck_act_final_track_beat_grid",
                    "(first_beat_seconds IS NULL OR first_beat_seconds >= 0) AND (tempo_bpm IS NULL OR tempo_bpm > 0)"
                );
            }
        );
        builder.HasKey(track => track.Id);

        builder
            .HasOne(track => track.Act)
            .WithMany()
            .HasForeignKey(track => track.ActId)
            .HasConstraintName("fk_act_final_track_act_act_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasIndex(track => new { track.ActId, track.Version })
            .HasDatabaseName("ix_act_final_track_act_id_version")
            .IsUnique();

        builder
            .HasOne(track => track.MediaItem)
            .WithMany()
            .HasForeignKey(track => track.MediaItemId)
            .HasConstraintName("fk_act_final_track_media_item_media_item_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasIndex(track => track.MediaItemId)
            .HasDatabaseName("ix_act_final_track_media_item_id")
            .IsUnique();

        builder.Property(track => track.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(track => track.UpdatedAt).HasDefaultValueSql("now()");
    }
}
