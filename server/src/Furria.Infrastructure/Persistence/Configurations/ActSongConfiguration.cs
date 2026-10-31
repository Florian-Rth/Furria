using Furria.Core.Studio;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class ActSongConfiguration : IEntityTypeConfiguration<ActSong>
{
    public void Configure(EntityTypeBuilder<ActSong> builder)
    {
        builder.ToTable(
            "act_song",
            table =>
            {
                table.HasCheckConstraint("ck_act_song_position", "position >= 0");
                table.HasCheckConstraint(
                    "ck_act_song_cut",
                    "start_seconds >= 0 AND (end_seconds IS NULL OR end_seconds > start_seconds)"
                );
                table.HasCheckConstraint(
                    "ck_act_song_beat_grid",
                    "(first_beat_seconds IS NULL OR first_beat_seconds >= 0) AND (tempo_bpm IS NULL OR tempo_bpm > 0)"
                );
            }
        );
        builder.HasKey(song => song.Id);

        builder
            .HasOne(song => song.Act)
            .WithMany()
            .HasForeignKey(song => song.ActId)
            .HasConstraintName("fk_act_song_act_act_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(song => song.ActId).HasDatabaseName("ix_act_song_act_id");

        builder
            .HasOne(song => song.MediaItem)
            .WithMany()
            .HasForeignKey(song => song.MediaItemId)
            .HasConstraintName("fk_act_song_media_item_media_item_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasIndex(song => song.MediaItemId)
            .HasDatabaseName("ix_act_song_media_item_id")
            .IsUnique();
    }
}
