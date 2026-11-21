using Furria.Infrastructure.WhatsApp;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class WhatsAppMessageConfiguration : IEntityTypeConfiguration<WhatsAppMessage>
{
    private const int EnumLength = 32;

    private static readonly string KnownAddOnKinds = string.Join(
        ", ",
        Enum.GetNames<WhatsAppAddOnKind>().Select(name => $"'{name}'")
    );

    private static readonly string KnownHostKinds = string.Join(
        ", ",
        Enum.GetNames<WhatsAppHostKind>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<WhatsAppMessage> builder)
    {
        builder.ToTable(
            "whatsapp_message",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_whatsapp_message_host_kind",
                    $"host_kind IN ({KnownHostKinds})"
                );
                table.HasCheckConstraint(
                    "ck_whatsapp_message_add_on_kind",
                    $"add_on_kind IN ({KnownAddOnKinds})"
                );
                table.HasCheckConstraint(
                    "ck_whatsapp_message_add_on_id",
                    WhatsAppAddOnRules.AddOnIdCheck
                );
                table.HasCheckConstraint(
                    "ck_whatsapp_message_poll_option_ids",
                    WhatsAppAddOnRules.PollOptionIdsCheck
                );
                table.HasCheckConstraint(
                    "ck_whatsapp_message_poll_options",
                    WhatsAppAddOnRules.PollOptionsCheck
                );
            }
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
        builder
            .Property(message => message.AddOnKind)
            .HasConversion<string>()
            .HasMaxLength(EnumLength);
        builder
            .Property(message => message.PollOptions)
            .IsRequired()
            .HasDefaultValueSql(WhatsAppAddOnRules.EmptyArray);
        builder
            .Property(message => message.PollOptionIds)
            .IsRequired()
            .HasDefaultValueSql(WhatsAppAddOnRules.EmptyArray);

        builder.HasIndex(message => new { message.ChatId, message.MessageId }).IsUnique();
        builder.HasIndex(message => new { message.HostKind, message.HostId });
        builder
            .HasIndex(message => new { message.AddOnKind, message.AddOnId })
            .HasFilter("add_on_id IS NOT NULL");
    }
}
