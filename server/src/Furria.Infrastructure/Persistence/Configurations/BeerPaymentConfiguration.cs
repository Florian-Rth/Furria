using Furria.Core.BeerList;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class BeerPaymentConfiguration : IEntityTypeConfiguration<BeerPayment>
{
    public void Configure(EntityTypeBuilder<BeerPayment> builder)
    {
        builder.ToTable(
            "beer_payment",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_beer_payment_crates",
                    $"crates > 0 AND crates <= {BeerPayment.MaxCrates}"
                );
                table.HasCheckConstraint(
                    "ck_beer_payment_amount",
                    $"amount_cents >= crates AND amount_cents <= crates * {BeerPot.MaxCratePriceCents}"
                );
                table.HasCheckConstraint(
                    "ck_beer_payment_undone",
                    "(undone_at IS NULL AND undone_by_person_id IS NULL)"
                        + " OR (undone_at IS NOT NULL AND undone_at >= booked_at)"
                );
            }
        );
        builder.HasKey(payment => payment.Id);
        builder
            .HasAlternateKey(payment => new { payment.Id, payment.BeerPotId })
            .HasName("ak_beer_payment_id_beer_pot_id");

        builder
            .HasOne(payment => payment.Pot)
            .WithMany()
            .HasForeignKey(payment => payment.BeerPotId)
            .HasConstraintName("fk_beer_payment_beer_pot_beer_pot_id")
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasOne(payment => payment.Person)
            .WithMany()
            .HasForeignKey(payment => payment.PersonId)
            .HasConstraintName("fk_beer_payment_person_person_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder
            .HasOne(payment => payment.BookedBy)
            .WithMany()
            .HasForeignKey(payment => payment.BookedByPersonId)
            .HasConstraintName("fk_beer_payment_person_booked_by_person_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder
            .HasOne(payment => payment.UndoneBy)
            .WithMany()
            .HasForeignKey(payment => payment.UndoneByPersonId)
            .HasConstraintName("fk_beer_payment_person_undone_by_person_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder
            .HasIndex(
                payment => new { payment.BeerPotId, payment.PersonId },
                "ix_beer_payment_beer_pot_id_person_id_standing"
            )
            .HasDatabaseName("ix_beer_payment_beer_pot_id_person_id_standing")
            .HasFilter("undone_at IS NULL");
        builder.HasIndex(payment => payment.PersonId);
        builder.HasIndex(payment => payment.BookedByPersonId);
        builder.HasIndex(payment => payment.UndoneByPersonId);
    }
}
