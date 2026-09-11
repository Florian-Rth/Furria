using Furria.Core.Roles;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class RoleHoldingConfiguration : IEntityTypeConfiguration<RoleHolding>
{
    public void Configure(EntityTypeBuilder<RoleHolding> builder)
    {
        builder.ToTable(
            "role_holding",
            table =>
                table.HasCheckConstraint(
                    "ck_role_holding_period",
                    "until_on IS NULL OR until_on >= since_on"
                )
        );
        builder.HasKey(holding => holding.Id);

        builder
            .HasOne(holding => holding.Role)
            .WithMany(role => role.Holdings)
            .HasForeignKey(holding => holding.RoleId)
            .HasConstraintName("fk_role_holding_role_role_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(holding => holding.Person)
            .WithMany(person => person.RoleHoldings)
            .HasForeignKey(holding => holding.PersonId)
            .HasConstraintName("fk_role_holding_person_person_id")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(holding => holding.PersonId);
        builder.HasIndex(holding => new { holding.RoleId, holding.PersonId });
        builder
            .HasIndex(
                holding => new { holding.RoleId, holding.PersonId },
                "ix_role_holding_role_id_person_id_open"
            )
            .HasDatabaseName("ix_role_holding_role_id_person_id_open")
            .IsUnique()
            .HasFilter("until_on IS NULL");

        builder.Property(holding => holding.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(holding => holding.UpdatedAt).HasDefaultValueSql("now()");
    }
}
