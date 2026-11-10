using Furria.Core.Club;
using Furria.Infrastructure.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class OutboxCalendarPushConfiguration : IEntityTypeConfiguration<OutboxCalendarPush>
{
    private const int EnumLength = 32;

    private static readonly string KnownReasons = NamesOf<CalendarPushReason>();
    private static readonly string KnownKinds = NamesOf<CalendarEntryKind>();
    private static readonly string KnownAudiences = NamesOf<CalendarEntryAudience>();

    public void Configure(EntityTypeBuilder<OutboxCalendarPush> builder)
    {
        builder.ToTable(
            "outbox_calendar_push",
            table =>
            {
                table.HasCheckConstraint("ck_outbox_calendar_push_attempt", "attempt >= 1");
                table.HasCheckConstraint(
                    "ck_outbox_calendar_push_reason",
                    $"reason IN ({KnownReasons})"
                );
                table.HasCheckConstraint("ck_outbox_calendar_push_kind", $"kind IN ({KnownKinds})");
                table.HasCheckConstraint(
                    "ck_outbox_calendar_push_audience",
                    $"audience IN ({KnownAudiences})"
                );
                table.HasCheckConstraint(
                    "ck_outbox_calendar_push_recipients",
                    $"reason = '{nameof(CalendarPushReason.AsksForResponse)}' OR cardinality(person_ids) > 0"
                );
            }
        );
        builder.HasKey(push => push.Id);

        builder.Property(push => push.Reason).HasConversion<string>().HasMaxLength(EnumLength);
        builder.Property(push => push.Kind).HasConversion<string>().HasMaxLength(EnumLength);
        builder.Property(push => push.Audience).HasConversion<string>().HasMaxLength(EnumLength);
        builder.Property(push => push.PersonIds).IsRequired();
        builder.Property(push => push.ParticipatingGroupIds).IsRequired();
        builder.Property(push => push.AudienceGroupIds).IsRequired();
        builder.Property(push => push.AudiencePersonIds).IsRequired();
        builder
            .Property(push => push.Title)
            .HasMaxLength(CalendarEntryConfiguration.TitleLength)
            .IsRequired();
        builder.Property(push => push.VenueName).HasMaxLength(VenueConfiguration.NameLength);

        builder.HasIndex(push => push.NextAttemptAt);
    }

    private static string NamesOf<TEnum>()
        where TEnum : struct, Enum =>
        string.Join(", ", Enum.GetNames<TEnum>().Select(name => $"'{name}'"));
}
