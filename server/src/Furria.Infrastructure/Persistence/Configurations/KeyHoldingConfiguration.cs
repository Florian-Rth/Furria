using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class KeyHoldingConfiguration : IEntityTypeConfiguration<KeyHolding>
{
    public void Configure(EntityTypeBuilder<KeyHolding> builder)
    {
        builder.ToTable(
            "key_holding",
            table =>
                table.HasCheckConstraint(
                    "ck_key_holding_period",
                    "until_on IS NULL OR until_on >= since_on"
                )
        );
        builder.HasKey(holding => holding.Id);

        builder
            .HasOne(holding => holding.Venue)
            .WithMany()
            .HasForeignKey(holding => holding.VenueId)
            .HasConstraintName("fk_key_holding_venue_venue_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(holding => holding.Person)
            .WithMany()
            .HasForeignKey(holding => holding.PersonId)
            .HasConstraintName("fk_key_holding_person_person_id")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(holding => holding.PersonId);
        builder.HasIndex(holding => holding.VenueId);

        builder.Property(holding => holding.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(holding => holding.UpdatedAt).HasDefaultValueSql("now()");
    }
}
