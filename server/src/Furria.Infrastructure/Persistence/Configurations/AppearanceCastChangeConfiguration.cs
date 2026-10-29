using Furria.Core.RunningOrders;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class AppearanceCastChangeConfiguration
    : IEntityTypeConfiguration<AppearanceCastChange>
{
    private const int EnumLength = 32;

    private static readonly string KnownChanges = string.Join(
        ", ",
        Enum.GetNames<CastChange>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<AppearanceCastChange> builder)
    {
        builder.ToTable(
            "appearance_cast_change",
            table =>
                table.HasCheckConstraint(
                    "ck_appearance_cast_change_change",
                    $"change IN ({KnownChanges})"
                )
        );
        builder.HasKey(change => new { change.AppearanceId, change.PersonId });

        builder.Property(change => change.Change).HasConversion<string>().HasMaxLength(EnumLength);

        builder
            .HasOne(change => change.Appearance)
            .WithMany(appearance => appearance.CastChanges)
            .HasForeignKey(change => change.AppearanceId)
            .HasConstraintName("fk_appearance_cast_change_appearance_appearance_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(change => change.Person)
            .WithMany()
            .HasForeignKey(change => change.PersonId)
            .HasConstraintName("fk_appearance_cast_change_person_person_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasIndex(change => change.PersonId)
            .HasDatabaseName("ix_appearance_cast_change_person_id");
    }
}
