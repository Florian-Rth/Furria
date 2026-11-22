using Furria.Infrastructure.WhatsApp;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class InboxWhatsAppEventConfiguration : IEntityTypeConfiguration<InboxWhatsAppEvent>
{
    public void Configure(EntityTypeBuilder<InboxWhatsAppEvent> builder)
    {
        builder.ToTable(
            "inbox_whatsapp",
            table => table.HasCheckConstraint("ck_inbox_whatsapp_attempt", "attempt >= 1")
        );
        builder.HasKey(inboxEvent => inboxEvent.Id);

        builder
            .Property(inboxEvent => inboxEvent.RequestId)
            .HasMaxLength(InboxWhatsAppEvent.RequestIdLength)
            .IsRequired();
        builder
            .Property(inboxEvent => inboxEvent.Event)
            .HasMaxLength(InboxWhatsAppEvent.EventLength)
            .IsRequired();
        builder
            .Property(inboxEvent => inboxEvent.Session)
            .HasMaxLength(WhatsAppSession.NameLength)
            .IsRequired();
        builder.Property(inboxEvent => inboxEvent.Body).HasColumnType("jsonb").IsRequired();

        builder.HasIndex(inboxEvent => inboxEvent.RequestId).IsUnique();
        builder
            .HasIndex(inboxEvent => inboxEvent.Id)
            .HasDatabaseName("ix_inbox_whatsapp_unprocessed")
            .HasFilter("processed_at IS NULL");
        builder
            .HasIndex(inboxEvent => inboxEvent.ProcessedAt)
            .HasFilter("processed_at IS NOT NULL");
    }
}
