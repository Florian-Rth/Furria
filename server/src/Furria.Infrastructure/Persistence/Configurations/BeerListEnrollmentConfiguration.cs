using Furria.Core.BeerList;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class BeerListEnrollmentConfiguration : IEntityTypeConfiguration<BeerListEnrollment>
{
    public void Configure(EntityTypeBuilder<BeerListEnrollment> builder)
    {
        builder.ToTable(
            "beer_list_enrollment",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_beer_list_enrollment_period",
                    "ended_at IS NULL OR ended_at >= started_at"
                );
                table.HasCheckConstraint(
                    "ck_beer_list_enrollment_ended_by",
                    "ended_by_person_id IS NULL OR ended_at IS NOT NULL"
                );
            }
        );
        builder.HasKey(enrollment => enrollment.Id);

        builder
            .HasOne(enrollment => enrollment.Person)
            .WithMany()
            .HasForeignKey(enrollment => enrollment.PersonId)
            .HasConstraintName("fk_beer_list_enrollment_person_person_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(enrollment => enrollment.EndedBy)
            .WithMany()
            .HasForeignKey(enrollment => enrollment.EndedByPersonId)
            .HasConstraintName("fk_beer_list_enrollment_person_ended_by_person_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(enrollment => enrollment.PersonId);
        builder.HasIndex(enrollment => enrollment.EndedByPersonId);
        builder
            .HasIndex(
                enrollment => enrollment.PersonId,
                "ix_beer_list_enrollment_person_id_running"
            )
            .HasDatabaseName("ix_beer_list_enrollment_person_id_running")
            .IsUnique()
            .HasFilter("ended_at IS NULL");

        builder.Property(enrollment => enrollment.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(enrollment => enrollment.UpdatedAt).HasDefaultValueSql("now()");
    }
}
