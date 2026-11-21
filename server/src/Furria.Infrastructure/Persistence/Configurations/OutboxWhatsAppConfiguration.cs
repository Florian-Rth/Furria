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
        builder.Property(operation => operation.Text).IsRequired();
        builder.Property(operation => operation.Mentions).IsRequired();
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
