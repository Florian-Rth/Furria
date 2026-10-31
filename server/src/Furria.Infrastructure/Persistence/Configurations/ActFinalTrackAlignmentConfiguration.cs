using Furria.Core.Studio;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class ActFinalTrackAlignmentConfiguration
    : IEntityTypeConfiguration<ActFinalTrackAlignment>
{
    public void Configure(EntityTypeBuilder<ActFinalTrackAlignment> builder)
    {
        builder.ToTable("act_final_track_alignment");
        builder.HasKey(alignment => new { alignment.FinalTrackId, alignment.SourceMediaItemId });
        builder
            .Property(alignment => alignment.Stretch)
            .HasDefaultValue(FinalTrackPlacement.Unstretched);

        builder
            .HasOne(alignment => alignment.FinalTrack)
            .WithMany(track => track.Alignments)
            .HasForeignKey(alignment => alignment.FinalTrackId)
            .HasConstraintName("fk_act_final_track_alignment_act_final_track_final_track_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(alignment => alignment.SourceMediaItem)
            .WithMany()
            .HasForeignKey(alignment => alignment.SourceMediaItemId)
            .HasConstraintName("fk_act_final_track_alignment_media_item_source_media_item_id")
            .OnDelete(DeleteBehavior.NoAction);
        builder
            .HasIndex(alignment => alignment.SourceMediaItemId)
            .HasDatabaseName("ix_act_final_track_alignment_source_media_item_id");
    }
}
