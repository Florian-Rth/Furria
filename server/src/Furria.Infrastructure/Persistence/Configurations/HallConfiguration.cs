using Furria.Core.Halls;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class HallConfiguration : IEntityTypeConfiguration<Hall>
{
    public const int NameLength = 60;

    public void Configure(EntityTypeBuilder<Hall> builder)
    {
        builder.ToTable(
            "hall",
            table =>
                table.HasCheckConstraint(
                    "ck_hall_document_shape",
                    "jsonb_typeof(document) = 'object' "
                        + "AND jsonb_typeof(document -> 'elements') = 'array'"
                )
        );
        builder.HasKey(hall => hall.Id);
        builder
            .Property(hall => hall.Name)
            .HasMaxLength(NameLength)
            .IsRequired()
            .UseCollation(GermanCollation.Name);
        builder.Property(hall => hall.Version).IsConcurrencyToken();
        PlanDocumentColumn.Configure(builder.Property(hall => hall.Document), HallDocument.Empty);

        builder
            .HasOne(hall => hall.Venue)
            .WithMany()
            .HasForeignKey(hall => hall.VenueId)
            .HasConstraintName("fk_hall_venue_venue_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasIndex(hall => new { hall.VenueId, hall.Name })
            .HasDatabaseName("ix_hall_venue_id_name")
            .IsUnique();

        builder.Property(hall => hall.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(hall => hall.UpdatedAt).HasDefaultValueSql("now()");
    }
}
