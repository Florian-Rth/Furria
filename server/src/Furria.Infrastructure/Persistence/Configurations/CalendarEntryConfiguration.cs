using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class CalendarEntryConfiguration : IEntityTypeConfiguration<CalendarEntry>
{
    private const int TitleLength = 120;
    private const int DescriptionLength = 2_000;
    private const int EnumLength = 32;
    private const CalendarEntryVisibility UnsetVisibility = 0;

    private static readonly string KnownKinds = string.Join(
        ", ",
        Enum.GetNames<CalendarEntryKind>().Select(name => $"'{name}'")
    );

    private static readonly string KnownVisibilities = string.Join(
        ", ",
        Enum.GetNames<CalendarEntryVisibility>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<CalendarEntry> builder)
    {
        builder.ToTable(
            "calendar_entry",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_calendar_entry_window",
                    "ends_at IS NULL OR ends_at >= starts_at"
                );
                table.HasCheckConstraint("ck_calendar_entry_kind", $"kind IN ({KnownKinds})");
                table.HasCheckConstraint(
                    "ck_calendar_entry_visibility",
                    $"visibility IN ({KnownVisibilities})"
                );
                table.HasCheckConstraint(
                    "ck_calendar_entry_owner_visibility",
                    "owner_group_id IS NOT NULL OR visibility <> 'Group'"
                );
            }
        );
        builder.HasKey(entry => entry.Id);

        builder.Property(entry => entry.Title).HasMaxLength(TitleLength).IsRequired();
        builder.Property(entry => entry.Description).HasMaxLength(DescriptionLength);
        builder.Property(entry => entry.Kind).HasConversion<string>().HasMaxLength(EnumLength);
        builder
            .Property(entry => entry.Visibility)
            .HasConversion<string>()
            .HasMaxLength(EnumLength)
            .HasDefaultValue(CalendarEntryVisibility.Club)
            .HasSentinel(UnsetVisibility);
        builder.Property(entry => entry.AsksForResponse).HasDefaultValue(false);

        builder
            .HasOne(entry => entry.Venue)
            .WithMany()
            .HasForeignKey(entry => entry.VenueId)
            .HasConstraintName("fk_calendar_entry_venue_venue_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder
            .HasOne(entry => entry.OwnerGroup)
            .WithMany()
            .HasForeignKey(entry => entry.OwnerGroupId)
            .HasConstraintName("fk_calendar_entry_group_owner_group_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(entry => entry.StartsAt).HasDatabaseName("ix_calendar_entry_starts_at");
        builder
            .HasIndex(entry => entry.OwnerGroupId)
            .HasDatabaseName("ix_calendar_entry_owner_group_id");
        builder
            .HasIndex(entry => new { entry.VenueId, entry.StartsAt })
            .HasDatabaseName("ix_calendar_entry_venue_id_starts_at");

        builder.Property(entry => entry.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(entry => entry.UpdatedAt).HasDefaultValueSql("now()");
    }
}
