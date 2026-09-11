using Furria.Core.Groups;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class GroupMembershipConfiguration : IEntityTypeConfiguration<GroupMembership>
{
    public void Configure(EntityTypeBuilder<GroupMembership> builder)
    {
        builder.ToTable(
            "group_membership",
            table =>
                table.HasCheckConstraint(
                    "ck_group_membership_period",
                    "left_on IS NULL OR left_on >= joined_on"
                )
        );
        builder.HasKey(membership => membership.Id);

        builder
            .HasOne(membership => membership.Group)
            .WithMany(group => group.Memberships)
            .HasForeignKey(membership => membership.GroupId)
            .HasConstraintName("fk_group_membership_group_group_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(membership => membership.Person)
            .WithMany(person => person.GroupMemberships)
            .HasForeignKey(membership => membership.PersonId)
            .HasConstraintName("fk_group_membership_person_person_id")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(membership => new { membership.GroupId, membership.PersonId });
        builder.HasIndex(membership => membership.PersonId);
        builder
            .HasIndex(
                membership => new { membership.GroupId, membership.PersonId },
                "ix_group_membership_group_id_person_id_open"
            )
            .HasDatabaseName("ix_group_membership_group_id_person_id_open")
            .IsUnique()
            .HasFilter("left_on IS NULL");

        builder.Property(membership => membership.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(membership => membership.UpdatedAt).HasDefaultValueSql("now()");
    }
}
