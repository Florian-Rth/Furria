using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class VenueOpeningSlotConfiguration : IEntityTypeConfiguration<VenueOpeningSlot>
{
    private const int EnumLength = 32;

    private static readonly string KnownWeekdays = string.Join(
        ", ",
        Enum.GetNames<DayOfWeek>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<VenueOpeningSlot> builder)
    {
        builder.ToTable(
            "venue_opening_slot",
            table =>
            {
                table.HasCheckConstraint("ck_venue_opening_slot_span", "closes > opens");
                table.HasCheckConstraint(
                    "ck_venue_opening_slot_weekday",
                    $"weekday IN ({KnownWeekdays})"
                );
            }
        );
        builder.HasKey(slot => slot.Id);

        builder.Property(slot => slot.Weekday).HasConversion<string>().HasMaxLength(EnumLength);

        builder
            .HasOne(slot => slot.Venue)
            .WithMany(venue => venue.OpeningSlots)
            .HasForeignKey(slot => slot.VenueId)
            .HasConstraintName("fk_venue_opening_slot_venue_venue_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(slot => slot.VenueId).HasDatabaseName("ix_venue_opening_slot_venue_id");

        builder.Property(slot => slot.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(slot => slot.UpdatedAt).HasDefaultValueSql("now()");
    }
}
