using Furria.Core.BeerList;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class BeerCrateConfiguration : IEntityTypeConfiguration<BeerCrate>
{
    public void Configure(EntityTypeBuilder<BeerCrate> builder)
    {
        builder.ToTable(
            "beer_crate",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_beer_crate_price",
                    $"price_cents > 0 AND price_cents <= {BeerPot.MaxCratePriceCents}"
                );
                table.HasCheckConstraint(
                    "ck_beer_crate_undone",
                    "(undone_at IS NULL AND undone_by_person_id IS NULL)"
                        + " OR (undone_at IS NOT NULL AND undone_at >= booked_at"
                        + " AND paid_by_payment_id IS NULL)"
                );
            }
        );
        builder.HasKey(crate => crate.Id);

        builder
            .HasOne(crate => crate.Pot)
            .WithMany()
            .HasForeignKey(crate => crate.BeerPotId)
            .HasConstraintName("fk_beer_crate_beer_pot_beer_pot_id")
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasOne(crate => crate.Person)
            .WithMany()
            .HasForeignKey(crate => crate.PersonId)
            .HasConstraintName("fk_beer_crate_person_person_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder
            .HasOne(crate => crate.EnteredBy)
            .WithMany()
            .HasForeignKey(crate => crate.EnteredByPersonId)
            .HasConstraintName("fk_beer_crate_person_entered_by_person_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder
            .HasOne(crate => crate.UndoneBy)
            .WithMany()
            .HasForeignKey(crate => crate.UndoneByPersonId)
            .HasConstraintName("fk_beer_crate_person_undone_by_person_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder
            .HasOne(crate => crate.PaidByPayment)
            .WithMany()
            .HasForeignKey(crate => new { crate.PaidByPaymentId, crate.BeerPotId })
            .HasPrincipalKey(payment => new { payment.Id, payment.BeerPotId })
            .HasConstraintName("fk_beer_crate_beer_payment_paid_by_payment_id_beer_pot_id")
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasIndex(
                crate => new { crate.BeerPotId, crate.PersonId },
                "ix_beer_crate_beer_pot_id_person_id_taken"
            )
            .HasDatabaseName("ix_beer_crate_beer_pot_id_person_id_taken")
            .HasFilter("undone_at IS NULL");
        builder.HasIndex(crate => crate.PersonId);
        builder
            .HasIndex(crate => crate.BookedAt, "ix_beer_crate_booked_at_taken")
            .HasDatabaseName("ix_beer_crate_booked_at_taken")
            .HasFilter("undone_at IS NULL");
        builder.HasIndex(crate => crate.EnteredByPersonId);
        builder.HasIndex(crate => crate.UndoneByPersonId);
        builder.HasIndex(crate => new { crate.PaidByPaymentId, crate.BeerPotId });
        builder
            .HasIndex(
                crate => new
                {
                    crate.PersonId,
                    crate.BeerPotId,
                    crate.BookedAt,
                    crate.Id,
                },
                "ix_beer_crate_open"
            )
            .HasDatabaseName("ix_beer_crate_open")
            .HasFilter("undone_at IS NULL AND paid_by_payment_id IS NULL")
            .IncludeProperties(crate => crate.PriceCents);
    }
}
