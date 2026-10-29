using Furria.Core.Studio;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class ActPartConfiguration : IEntityTypeConfiguration<ActPart>
{
    public void Configure(EntityTypeBuilder<ActPart> builder)
    {
        builder.ToTable("act_part");
        builder.HasKey(part => part.Id);

        builder.Property(part => part.Name).HasMaxLength(ActPart.NameLength);

        builder
            .HasOne(part => part.Act)
            .WithMany()
            .HasForeignKey(part => part.ActId)
            .HasConstraintName("fk_act_part_act_act_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(part => part.ActId).HasDatabaseName("ix_act_part_act_id");

        builder
            .HasOne(part => part.FirstStep)
            .WithMany()
            .HasForeignKey(part => part.FirstStepId)
            .HasConstraintName("fk_act_part_act_step_first_step_id")
            .OnDelete(DeleteBehavior.NoAction);
        builder
            .HasIndex(part => part.FirstStepId)
            .HasDatabaseName("ix_act_part_first_step_id")
            .IsUnique();

        builder
            .HasOne(part => part.MainVideo)
            .WithMany()
            .HasForeignKey(part => part.MainVideoId)
            .HasConstraintName("fk_act_part_act_video_main_video_id")
            .OnDelete(DeleteBehavior.SetNull);
        builder.HasIndex(part => part.MainVideoId).HasDatabaseName("ix_act_part_main_video_id");
    }
}
