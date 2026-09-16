using Furria.Core.Roles;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class RolePermissionConfiguration : IEntityTypeConfiguration<RolePermission>
{
    public void Configure(EntityTypeBuilder<RolePermission> builder)
    {
        builder.ToTable("role_permission");
        builder.HasKey(permission => permission.Id);

        builder.Property(permission => permission.PermissionKey).HasMaxLength(64).IsRequired();

        builder
            .HasOne(permission => permission.Role)
            .WithMany(role => role.Permissions)
            .HasForeignKey(permission => permission.RoleId)
            .HasConstraintName("fk_role_permission_role_role_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasIndex(permission => new { permission.RoleId, permission.PermissionKey })
            .IsUnique();

        builder.Property(permission => permission.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(permission => permission.UpdatedAt).HasDefaultValueSql("now()");
    }
}
