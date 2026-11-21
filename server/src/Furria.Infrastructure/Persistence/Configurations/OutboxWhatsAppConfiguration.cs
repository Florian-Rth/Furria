using Furria.Infrastructure.WhatsApp;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class OutboxWhatsAppConfiguration : IEntityTypeConfiguration<OutboxWhatsApp>
{
    private const int EnumLength = 32;

    private static readonly string KnownOperations = string.Join(
        ", ",
        Enum.GetNames<WhatsAppOperation>().Select(name => $"'{name}'")
    );

    private static readonly string KnownAddOnKinds = string.Join(
        ", ",
        Enum.GetNames<WhatsAppAddOnKind>().Select(name => $"'{name}'")
    );

    private static readonly string KnownHostKinds = string.Join(
        ", ",
        Enum.GetNames<WhatsAppHostKind>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<OutboxWhatsApp> builder)
    {
        builder.ToTable(
            "outbox_whatsapp",
            table =>
            {
                table.HasCheckConstraint("ck_outbox_whatsapp_attempt", "attempt >= 1");
                table.HasCheckConstraint(
                    "ck_outbox_whatsapp_operation",
                    $"operation IN ({KnownOperations})"
                );
                table.HasCheckConstraint(
                    "ck_outbox_whatsapp_host_kind",
                    $"host_kind IN ({KnownHostKinds})"
                );
                table.HasCheckConstraint(
                    "ck_outbox_whatsapp_add_on_kind",
                    $"add_on_kind IN ({KnownAddOnKinds})"
                );
                table.HasCheckConstraint(
                    "ck_outbox_whatsapp_add_on_id",
                    WhatsAppAddOnRules.AddOnIdCheck
                );
                table.HasCheckConstraint(
                    "ck_outbox_whatsapp_poll_option_ids",
                    WhatsAppAddOnRules.PollOptionIdsCheck
                );
                table.HasCheckConstraint(
                    "ck_outbox_whatsapp_poll_options",
                    WhatsAppAddOnRules.PollOptionsCheck
                );
                table.HasCheckConstraint(
                    "ck_outbox_whatsapp_add_on_operation",
                    $"operation = '{nameof(WhatsAppOperation.PostText)}' OR add_on_kind IS NOT NULL"
                );
                table.HasCheckConstraint(
                    "ck_outbox_whatsapp_poll",
                    $"(operation = '{nameof(WhatsAppOperation.SendPoll)}') = (cardinality(poll_options) BETWEEN 2 AND {WhatsAppAddOnMessages.NativePollMaxOptions})"
                );
                table.HasCheckConstraint(
                    "ck_outbox_whatsapp_event",
                    $"CASE WHEN operation = '{nameof(WhatsAppOperation.SendEvent)}'"
                        + " THEN event_starts_at IS NOT NULL"
                        + " AND (event_ends_at IS NULL OR event_ends_at >= event_starts_at)"
                        + " ELSE event_starts_at IS NULL AND event_ends_at IS NULL"
                        + " AND event_place IS NULL END"
                );
            }
        );
        builder.HasKey(operation => operation.Id);

        builder
            .Property(operation => operation.ChatId)
            .HasMaxLength(LinkedWhatsAppGroup.ChatIdLength)
            .IsRequired();
        builder
            .Property(operation => operation.Operation)
            .HasConversion<string>()
            .HasMaxLength(EnumLength);
        builder
            .Property(operation => operation.HostKind)
            .HasConversion<string>()
            .HasMaxLength(EnumLength);
        builder
            .Property(operation => operation.AddOnKind)
            .HasConversion<string>()
            .HasMaxLength(EnumLength);
        builder
            .Property(operation => operation.PollOptions)
            .IsRequired()
            .HasDefaultValueSql(WhatsAppAddOnRules.EmptyArray);
        builder
            .Property(operation => operation.PollOptionIds)
            .IsRequired()
            .HasDefaultValueSql(WhatsAppAddOnRules.EmptyArray);
        builder.Property(operation => operation.Text).IsRequired();
        builder.Property(operation => operation.Mentions).IsRequired();
        builder
            .Property(operation => operation.EventPlace)
            .HasMaxLength(VenueConfiguration.NameLength);
        builder.Property(operation => operation.LastError).HasMaxLength(OutboxWhatsApp.ErrorLength);

        builder
            .HasIndex(operation => new { operation.ChatId, operation.Id })
            .HasDatabaseName("ix_outbox_whatsapp_waiting")
            .HasFilter("failed_at IS NULL");
        builder
            .HasIndex(operation => operation.FailedAt)
            .HasDatabaseName("ix_outbox_whatsapp_failed")
            .HasFilter("failed_at IS NOT NULL");
        builder.HasIndex(operation => new { operation.HostKind, operation.HostId });
    }
}
