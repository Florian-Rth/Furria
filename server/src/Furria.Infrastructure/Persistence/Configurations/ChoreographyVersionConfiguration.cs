using Furria.Core.Studio;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class ChoreographyVersionConfiguration : IEntityTypeConfiguration<ChoreographyVersion>
{
    private const int EnumLength = 32;

    private static readonly string KnownKinds = string.Join(
        ", ",
        Enum.GetNames<ChoreographyVersionKind>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<ChoreographyVersion> builder)
    {
        builder.ToTable(
            "choreography_version",
            table =>
            {
                table.HasCheckConstraint("ck_choreography_version_version", "version >= 1");
                table.HasCheckConstraint("ck_choreography_version_kind", $"kind IN ({KnownKinds})");
                table.HasCheckConstraint(
                    "ck_choreography_version_restored_from",
                    $"(kind = '{ChoreographyVersionKind.Restored}') = (restored_from_version IS NOT NULL)"
                );
                table.HasCheckConstraint(
                    "ck_choreography_version_document",
                    ChoreographyDocumentColumn.ShapeCheck
                );
            }
        );
        builder.HasKey(version => version.Id);

        ChoreographyDocumentColumn.Configure(builder.Property(version => version.Document));
        builder.Property(version => version.Kind).HasConversion<string>().HasMaxLength(EnumLength);
        builder.Property(version => version.SavedAt).HasDefaultValueSql("now()");

        builder
            .HasOne(version => version.Choreography)
            .WithMany()
            .HasForeignKey(version => version.ChoreographyId)
            .HasConstraintName("fk_choreography_version_choreography_choreography_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasIndex(version => new { version.ChoreographyId, version.Version })
            .HasDatabaseName("ix_choreography_version_choreography_id_version")
            .IsUnique();

        builder
            .HasOne(version => version.SavedBy)
            .WithMany()
            .HasForeignKey(version => version.SavedByPersonId)
            .HasConstraintName("fk_choreography_version_person_saved_by_person_id")
            .OnDelete(DeleteBehavior.SetNull);
        builder
            .HasIndex(version => version.SavedByPersonId)
            .HasDatabaseName("ix_choreography_version_saved_by_person_id");
    }
}
