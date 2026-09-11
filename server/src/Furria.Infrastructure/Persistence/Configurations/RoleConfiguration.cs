using Furria.Core.Roles;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("role");
        builder.HasKey(role => role.Id);

        builder.Property(role => role.Name).HasMaxLength(80).IsRequired();
        builder.Property(role => role.Description).HasMaxLength(400).IsRequired();

        builder.HasIndex(role => role.Name).HasDatabaseName("ix_role_name_lookup");

        builder.Property(role => role.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(role => role.UpdatedAt).HasDefaultValueSql("now()");
    }
}
