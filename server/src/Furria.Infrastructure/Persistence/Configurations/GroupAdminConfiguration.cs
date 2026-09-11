using Furria.Core.Groups;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class GroupAdminConfiguration : IEntityTypeConfiguration<GroupAdmin>
{
    public void Configure(EntityTypeBuilder<GroupAdmin> builder)
    {
        builder.ToTable(
            "group_admin",
            table =>
                table.HasCheckConstraint(
                    "ck_group_admin_period",
                    "until_on IS NULL OR until_on >= since_on"
                )
        );
        builder.HasKey(admin => admin.Id);

        builder.Property(admin => admin.Function).HasMaxLength(64);

        builder
            .HasOne(admin => admin.Group)
            .WithMany(group => group.Admins)
            .HasForeignKey(admin => admin.GroupId)
            .HasConstraintName("fk_group_admin_group_group_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(admin => admin.Person)
            .WithMany(person => person.GroupAdminships)
            .HasForeignKey(admin => admin.PersonId)
            .HasConstraintName("fk_group_admin_person_person_id")
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasIndex(
                admin => new { admin.GroupId, admin.PersonId },
                "ix_group_admin_group_id_person_id_open"
            )
            .HasDatabaseName("ix_group_admin_group_id_person_id_open")
            .IsUnique()
            .HasFilter("until_on IS NULL");

        builder.Property(admin => admin.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(admin => admin.UpdatedAt).HasDefaultValueSql("now()");
    }
}
