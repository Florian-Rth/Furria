using Furria.Core.Groups;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class GroupConfiguration : IEntityTypeConfiguration<Group>
{
    private const int EnumLength = 32;
    private const int EarliestFoundedYear = 1800;

    private static readonly string KnownTones = string.Join(
        ", ",
        Enum.GetNames<GroupTone>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<Group> builder)
    {
        builder.ToTable(
            "group",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_group_founded_year",
                    $"founded_year IS NULL OR founded_year >= {EarliestFoundedYear}"
                );
                table.HasCheckConstraint(
                    "ck_group_tone",
                    $"tone IS NULL OR tone IN ({KnownTones})"
                );
            }
        );
        builder.HasKey(group => group.Id);

        builder
            .Property(group => group.Name)
            .HasMaxLength(80)
            .IsRequired()
            .UseCollation(GermanCollation.Name);
        builder.Property(group => group.Description).HasMaxLength(400).IsRequired();
        builder.Property(group => group.IsRecruiting).HasDefaultValue(false);
        builder.Property(group => group.Tone).HasConversion<string>().HasMaxLength(EnumLength);

        builder
            .HasOne(group => group.GroupKind)
            .WithMany()
            .HasForeignKey(group => group.GroupKindId)
            .HasConstraintName("fk_group_group_kind_group_kind_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(group => group.Name).HasDatabaseName("ix_group_name_lookup");
        builder.HasIndex(group => group.GroupKindId).HasDatabaseName("ix_group_group_kind_id");

        builder.Property(group => group.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(group => group.UpdatedAt).HasDefaultValueSql("now()");
    }
}
