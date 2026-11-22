using Furria.Infrastructure.WhatsApp;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class WhatsAppLateAnswerConfiguration : IEntityTypeConfiguration<WhatsAppLateAnswer>
{
    public void Configure(EntityTypeBuilder<WhatsAppLateAnswer> builder)
    {
        builder.ToTable("whatsapp_late_answer");
        builder.HasKey(late => late.Id);
        builder.Property(late => late.WhatsAppMessageId).HasColumnName("whatsapp_message_id");
        builder
            .Property(late => late.SenderId)
            .HasMaxLength(WhatsAppAnswer.SenderIdLength)
            .IsRequired();

        builder
            .HasOne(late => late.WhatsAppMessage)
            .WithMany()
            .HasForeignKey(late => late.WhatsAppMessageId)
            .HasConstraintName("fk_whatsapp_late_answer_whatsapp_message_whatsapp_message_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasIndex(late => new { late.WhatsAppMessageId, late.SenderId })
            .HasDatabaseName("ix_whatsapp_late_answer_whatsapp_message_id_sender_id")
            .IsUnique();
    }
}
