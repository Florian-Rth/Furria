using Furria.Core.BeerList;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class BeerPotDrinkConfiguration : IEntityTypeConfiguration<BeerPotDrink>
{
    public void Configure(EntityTypeBuilder<BeerPotDrink> builder)
    {
        builder.ToTable(
            "beer_pot_drink",
            table =>
                table.HasCheckConstraint(
                    "ck_beer_pot_drink_crate_price",
                    $"crate_price_cents > 0 AND crate_price_cents <= {BeerPotDrink.MaxCratePriceCents}"
                )
        );
        builder.HasKey(potDrink => potDrink.Id);
        builder
            .HasAlternateKey(potDrink => new { potDrink.BeerPotId, potDrink.BeerDrinkId })
            .HasName("ak_beer_pot_drink_beer_pot_id_beer_drink_id");

        builder
            .HasOne(potDrink => potDrink.Pot)
            .WithMany()
            .HasForeignKey(potDrink => potDrink.BeerPotId)
            .HasConstraintName("fk_beer_pot_drink_beer_pot_beer_pot_id")
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasOne(potDrink => potDrink.Drink)
            .WithMany()
            .HasForeignKey(potDrink => potDrink.BeerDrinkId)
            .HasConstraintName("fk_beer_pot_drink_beer_drink_beer_drink_id")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(potDrink => potDrink.BeerDrinkId);
        builder
            .HasIndex(potDrink => potDrink.BeerPotId)
            .IsUnique()
            .HasFilter("is_default")
            .HasDatabaseName("ix_beer_pot_drink_beer_pot_id_default");
    }
}
