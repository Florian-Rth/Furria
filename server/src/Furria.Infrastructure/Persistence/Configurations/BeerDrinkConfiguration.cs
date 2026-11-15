using Furria.Core.BeerList;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class BeerDrinkConfiguration : IEntityTypeConfiguration<BeerDrink>
{
    public void Configure(EntityTypeBuilder<BeerDrink> builder)
    {
        builder.ToTable(
            "beer_drink",
            table => table.HasCheckConstraint("ck_beer_drink_name", "btrim(name) <> ''")
        );
        builder.HasKey(drink => drink.Id);

        builder
            .Property(drink => drink.Name)
            .HasMaxLength(BeerDrink.NameLength)
            .IsRequired()
            .UseCollation(GermanCollation.Name);
    }
}
