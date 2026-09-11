using Furria.Core.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class MembershipConfiguration : IEntityTypeConfiguration<Membership>
{
    public void Configure(EntityTypeBuilder<Membership> builder)
    {
        builder.ToTable(
            "membership",
            table =>
                table.HasCheckConstraint(
                    "ck_membership_period",
                    "ended_on IS NULL OR ended_on >= started_on"
                )
        );
        builder.HasKey(membership => membership.Id);

        builder
            .HasOne(membership => membership.Person)
            .WithMany(person => person.Memberships)
            .HasForeignKey(membership => membership.PersonId)
            .HasConstraintName("fk_membership_person_person_id")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(membership => membership.PersonId);
        builder
            .HasIndex(membership => membership.PersonId, "ix_membership_person_id_open")
            .HasDatabaseName("ix_membership_person_id_open")
            .IsUnique()
            .HasFilter("ended_on IS NULL");

        builder.Property(membership => membership.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(membership => membership.UpdatedAt).HasDefaultValueSql("now()");
    }
}
