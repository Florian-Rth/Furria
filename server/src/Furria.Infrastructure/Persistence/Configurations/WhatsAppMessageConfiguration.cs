using Furria.Infrastructure.WhatsApp;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class WhatsAppMessageConfiguration : IEntityTypeConfiguration<WhatsAppMessage>
{
    private const int EnumLength = 32;

    private static readonly string KnownHostKinds = string.Join(
        ", ",
        Enum.GetNames<WhatsAppHostKind>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<WhatsAppMessage> builder)
    {
        builder.ToTable(
            "whatsapp_message",
            table =>
                table.HasCheckConstraint(
                    "ck_whatsapp_message_host_kind",
                    $"host_kind IN ({KnownHostKinds})"
                )
        );
        builder.HasKey(message => message.Id);

        builder
            .Property(message => message.ChatId)
            .HasMaxLength(LinkedWhatsAppGroup.ChatIdLength)
            .IsRequired();
        builder
            .Property(message => message.MessageId)
            .HasMaxLength(WhatsAppMessage.MessageIdLength)
            .IsRequired();
        builder
            .Property(message => message.HostKind)
            .HasConversion<string>()
            .HasMaxLength(EnumLength);

        builder.HasIndex(message => new { message.ChatId, message.MessageId }).IsUnique();
        builder.HasIndex(message => new { message.HostKind, message.HostId });
    }
}
