using Furria.Core.BeerList;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class BeerStockMovementConfiguration : IEntityTypeConfiguration<BeerStockMovement>
{
    private const int EnumLength = 16;

    public void Configure(EntityTypeBuilder<BeerStockMovement> builder)
    {
        builder.ToTable(
            "beer_stock_movement",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_beer_stock_movement_crates",
                    "crates <> 0 AND (kind IN ('HandoverCarry', 'HandedOver')"
                        + $" OR abs(crates) <= {BeerStockMovement.MaxCrates})"
                );
                table.HasCheckConstraint(
                    "ck_beer_stock_movement_kind",
                    "(kind IN ('Delivery', 'HandoverCarry') AND crates > 0)"
                        + " OR (kind = 'HandedOver' AND crates < 0)"
                        + " OR kind = 'Correction'"
                );
            }
        );
        builder.HasKey(movement => movement.Id);

        builder
            .Property(movement => movement.Kind)
            .HasConversion<string>()
            .HasMaxLength(EnumLength);

        builder
            .HasOne(movement => movement.Pot)
            .WithMany()
            .HasForeignKey(movement => movement.BeerPotId)
            .HasConstraintName("fk_beer_stock_movement_beer_pot_beer_pot_id")
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasOne(movement => movement.BookedBy)
            .WithMany()
            .HasForeignKey(movement => movement.BookedByPersonId)
            .HasConstraintName("fk_beer_stock_movement_person_booked_by_person_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder
            .HasIndex(movement => new { movement.BeerPotId, movement.BookedAt })
            .IncludeProperties(movement => movement.Crates);
        builder
            .HasIndex(
                movement => new { movement.BeerPotId, movement.Kind },
                "ix_beer_stock_movement_beer_pot_id_kind_handover"
            )
            .HasDatabaseName("ix_beer_stock_movement_beer_pot_id_kind_handover")
            .IsUnique()
            .HasFilter("kind IN ('HandoverCarry', 'HandedOver')");
        builder.HasIndex(movement => movement.BookedByPersonId);
    }
}
