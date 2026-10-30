using Furria.Core.Studio;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class ActStepConfiguration : IEntityTypeConfiguration<ActStep>
{
    public void Configure(EntityTypeBuilder<ActStep> builder)
    {
        builder.ToTable(
            "act_step",
            table => table.HasCheckConstraint("ck_act_step_start", "start_seconds >= 0")
        );
        builder.HasKey(step => step.Id);

        builder.Property(step => step.Name).HasMaxLength(ActStep.NameLength);
        builder.Property(step => step.Description).HasMaxLength(ActStep.DescriptionLength);

        builder
            .HasOne(step => step.Act)
            .WithMany()
            .HasForeignKey(step => step.ActId)
            .HasConstraintName("fk_act_step_act_act_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(step => step.ActId).HasDatabaseName("ix_act_step_act_id");
        builder
            .HasIndex(step => new
            {
                step.ActId,
                step.StartSourceMediaItemId,
                step.StartSeconds,
            })
            .HasDatabaseName("ix_act_step_act_id_start")
            .IsUnique();

        builder
            .HasOne(step => step.StartSource)
            .WithMany()
            .HasForeignKey(step => step.StartSourceMediaItemId)
            .HasConstraintName("fk_act_step_media_item_start_source_media_item_id")
            .OnDelete(DeleteBehavior.NoAction);
        builder
            .HasIndex(step => step.StartSourceMediaItemId)
            .HasDatabaseName("ix_act_step_start_source_media_item_id");
    }
}
