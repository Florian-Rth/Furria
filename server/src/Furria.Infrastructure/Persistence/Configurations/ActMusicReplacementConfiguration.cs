using Furria.Core.Studio;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class ActMusicReplacementConfiguration : IEntityTypeConfiguration<ActMusicReplacement>
{
    private const int FingerprintLength = 64;

    public void Configure(EntityTypeBuilder<ActMusicReplacement> builder)
    {
        builder.ToTable(
            "act_music_replacement",
            table =>
                table.HasCheckConstraint(
                    "ck_act_music_replacement_before",
                    "jsonb_typeof(before) = 'object'"
                )
        );
        builder.HasKey(replacement => replacement.Id);

        PlanDocumentColumn.Configure(
            builder.Property(replacement => replacement.Before),
            MusicBeforeReplacement.Empty
        );
        builder
            .Property(replacement => replacement.Fingerprint)
            .HasMaxLength(FingerprintLength)
            .IsFixedLength();

        builder
            .HasOne(replacement => replacement.Act)
            .WithMany()
            .HasForeignKey(replacement => replacement.ActId)
            .HasConstraintName("fk_act_music_replacement_act_act_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasIndex(replacement => replacement.ActId)
            .HasDatabaseName("ix_act_music_replacement_act_id")
            .IsUnique();

        builder
            .HasOne(replacement => replacement.Song)
            .WithMany()
            .HasForeignKey(replacement => replacement.SongId)
            .HasConstraintName("fk_act_music_replacement_act_song_song_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasIndex(replacement => replacement.SongId)
            .HasDatabaseName("ix_act_music_replacement_song_id");
    }
}
