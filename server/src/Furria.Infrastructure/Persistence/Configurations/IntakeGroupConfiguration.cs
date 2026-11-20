using Furria.Core.Intakes;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class IntakeGroupConfiguration : IEntityTypeConfiguration<IntakeGroup>
{
    public void Configure(EntityTypeBuilder<IntakeGroup> builder)
    {
        builder.ToTable("intake_group");
        builder.HasKey(link => new { link.IntakeId, link.GroupId });

        builder
            .HasOne(link => link.Intake)
            .WithMany(intake => intake.Groups)
            .HasForeignKey(link => link.IntakeId)
            .HasConstraintName("fk_intake_group_intake_intake_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(link => link.Group)
            .WithMany()
            .HasForeignKey(link => link.GroupId)
            .HasConstraintName("fk_intake_group_group_group_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(link => link.GroupId).HasDatabaseName("ix_intake_group_group_id");
    }
}
