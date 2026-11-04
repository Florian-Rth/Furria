using Furria.Core.BeerList;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class BeerPotConfiguration : IEntityTypeConfiguration<BeerPot>
{
    public void Configure(EntityTypeBuilder<BeerPot> builder)
    {
        builder.ToTable(
            "beer_pot",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_beer_pot_crate_price",
                    $"crate_price_cents > 0 AND crate_price_cents <= {BeerPot.MaxCratePriceCents}"
                );
                table.HasCheckConstraint(
                    "ck_beer_pot_payment_details",
                    "btrim(coalesce(payment_link, '')) <> '' OR btrim(coalesce(payment_note, '')) <> ''"
                );
                table.HasCheckConstraint(
                    "ck_beer_pot_period",
                    "closed_at IS NULL OR closed_at >= opened_at"
                );
            }
        );
        builder.HasKey(pot => pot.Id);

        builder.Property(pot => pot.PaymentLink).HasMaxLength(BeerPot.PaymentLinkLength);
        builder.Property(pot => pot.PaymentNote).HasMaxLength(BeerPot.PaymentNoteLength);

        builder
            .HasOne(pot => pot.Owner)
            .WithMany()
            .HasForeignKey(pot => pot.OwnerPersonId)
            .HasConstraintName("fk_beer_pot_person_owner_person_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(pot => pot.OwnerPersonId);
        builder
            .HasIndex(pot => pot.ClosedAt, "ix_beer_pot_open")
            .HasDatabaseName("ix_beer_pot_open")
            .IsUnique()
            .AreNullsDistinct(false)
            .HasFilter("closed_at IS NULL");

        builder.Property(pot => pot.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(pot => pot.UpdatedAt).HasDefaultValueSql("now()");
    }
}
