using Furria.Core.Studio;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class ChoreographyConfiguration : IEntityTypeConfiguration<Choreography>
{
    public void Configure(EntityTypeBuilder<Choreography> builder)
    {
        builder.ToTable(
            "choreography",
            table =>
            {
                table.HasCheckConstraint("ck_choreography_version", "version >= 1");
                table.HasCheckConstraint(
                    "ck_choreography_copied_from_version",
                    "copied_from_version IS NULL OR appearance_id IS NOT NULL"
                );
                table.HasCheckConstraint(
                    "ck_choreography_document",
                    ChoreographyDocumentColumn.ShapeCheck
                );
            }
        );
        builder.HasKey(choreography => choreography.Id);

        ChoreographyDocumentColumn.Configure(
            builder.Property(choreography => choreography.Document)
        );
        builder.Property(choreography => choreography.Version).IsConcurrencyToken();

        builder
            .HasOne(choreography => choreography.Act)
            .WithMany()
            .HasForeignKey(choreography => choreography.ActId)
            .HasConstraintName("fk_choreography_act_act_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasIndex(choreography => choreography.ActId)
            .HasDatabaseName("ix_choreography_act_id");
        builder
            .HasIndex(choreography => choreography.ActId)
            .HasDatabaseName("ix_choreography_act_id_session")
            .HasFilter("appearance_id IS NULL")
            .IsUnique();

        builder
            .HasOne(choreography => choreography.Appearance)
            .WithMany()
            .HasForeignKey(choreography => choreography.AppearanceId)
            .HasConstraintName("fk_choreography_appearance_appearance_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasIndex(choreography => choreography.AppearanceId)
            .HasDatabaseName("ix_choreography_appearance_id")
            .IsUnique();

        builder.Property(choreography => choreography.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(choreography => choreography.UpdatedAt).HasDefaultValueSql("now()");
    }
}
