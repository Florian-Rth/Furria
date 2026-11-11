using Furria.Core.Club;
using Furria.Infrastructure.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class OutboxCalendarPushConfiguration : IEntityTypeConfiguration<OutboxCalendarPush>
{
    private const int EnumLength = 32;
    private const int ReminderSubjectLength = 200;

    private static readonly string KnownReasons = NamesOf<CalendarPushReason>();
    private static readonly string KnownKinds = NamesOf<CalendarEntryKind>();
    private static readonly string KnownAudiences = NamesOf<CalendarEntryAudience>();
    private static readonly string KnownReminderKinds = string.Join(
        ", ",
        Enum.GetValues<CalendarEntryAddOnKind>()
            .Where(CalendarReminderRules.Reminds)
            .Select(kind => $"'{kind}'")
    );

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
                    $"reason IN ('{nameof(CalendarPushReason.AsksForResponse)}', '{nameof(CalendarPushReason.Reminder)}') OR cardinality(person_ids) > 0"
                );
                table.HasCheckConstraint(
                    "ck_outbox_calendar_push_reminder_kind",
                    $"reminder_kind IS NULL OR reminder_kind IN ({KnownReminderKinds})"
                );
                table.HasCheckConstraint(
                    "ck_outbox_calendar_push_reminder",
                    $"(reason = '{nameof(CalendarPushReason.Reminder)}') = (reminder_kind IS NOT NULL AND reminder_add_on_id IS NOT NULL AND reminder_closes_at IS NOT NULL)"
                );
            }
        );
        builder.HasKey(push => push.Id);

        builder.Property(push => push.Reason).HasConversion<string>().HasMaxLength(EnumLength);
        builder.Property(push => push.Kind).HasConversion<string>().HasMaxLength(EnumLength);
        builder.Property(push => push.Audience).HasConversion<string>().HasMaxLength(EnumLength);
        builder
            .Property(push => push.ReminderKind)
            .HasConversion<string>()
            .HasMaxLength(EnumLength);
        builder.Property(push => push.ReminderSubject).HasMaxLength(ReminderSubjectLength);
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
