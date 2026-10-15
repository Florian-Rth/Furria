using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Core.Roles;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    private const int EnumLength = 32;

    private static readonly string KnownIcons = string.Join(
        ", ",
        Enum.GetNames<ClubIcon>().Select(name => $"'{name}'")
    );

    private static readonly string KnownTones = string.Join(
        ", ",
        Enum.GetNames<GroupTone>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable(
            "role",
            table =>
            {
                table.HasCheckConstraint("ck_role_icon", $"icon IS NULL OR icon IN ({KnownIcons})");
                table.HasCheckConstraint("ck_role_tone", $"tone IS NULL OR tone IN ({KnownTones})");
                table.HasCheckConstraint("ck_role_coin", "(icon IS NULL) = (tone IS NULL)");
            }
        );
        builder.HasKey(role => role.Id);

        builder
            .Property(role => role.Name)
            .HasMaxLength(80)
            .IsRequired()
            .UseCollation(GermanCollation.Name);
        builder.Property(role => role.Description).HasMaxLength(400).IsRequired();
        builder.Property(role => role.Icon).HasConversion<string>().HasMaxLength(EnumLength);
        builder.Property(role => role.Tone).HasConversion<string>().HasMaxLength(EnumLength);

        builder.HasIndex(role => role.Name).HasDatabaseName("ix_role_name_lookup");

        builder.Property(role => role.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(role => role.UpdatedAt).HasDefaultValueSql("now()");
    }
}
