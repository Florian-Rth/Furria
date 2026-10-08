using Furria.Core.Events;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class EventConfiguration : IEntityTypeConfiguration<Event>
{
    private const int TeaserLength = 160;
    private const int AgeHintLength = 40;
    private const int EnumLength = 32;
    private const TicketAvailability UnsetAvailability = 0;

    private static readonly string KnownAvailabilities = string.Join(
        ", ",
        Enum.GetNames<TicketAvailability>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<Event> builder)
    {
        builder.ToTable(
            "event",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_event_ticket_availability",
                    $"ticket_availability IN ({KnownAvailabilities})"
                );
                table.HasCheckConstraint(
                    "ck_event_price_cents",
                    "price_cents IS NULL OR price_cents >= 0"
                );
            }
        );
        builder.HasKey(row => row.CalendarEntryId);
        builder.Property(row => row.CalendarEntryId).ValueGeneratedNever();

        builder.Property(row => row.Teaser).HasMaxLength(TeaserLength).IsRequired();
        builder.Property(row => row.AgeHint).HasMaxLength(AgeHintLength);
        builder
            .Property(row => row.TicketAvailability)
            .HasConversion<string>()
            .HasMaxLength(EnumLength)
            .HasDefaultValue(TicketAvailability.Available)
            .HasSentinel(UnsetAvailability);

        builder
            .HasOne(row => row.CalendarEntry)
            .WithOne(entry => entry.Event)
            .HasForeignKey<Event>(row => row.CalendarEntryId)
            .HasConstraintName("fk_event_calendar_entry_calendar_entry_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(row => row.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(row => row.UpdatedAt).HasDefaultValueSql("now()");
    }
}
