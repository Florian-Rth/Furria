using Furria.Core.Club;
using Furria.Infrastructure.WhatsApp;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class WhatsAppAnswerConfiguration : IEntityTypeConfiguration<WhatsAppAnswer>
{
    private const int EnumLength = 32;

    private static readonly string KnownAnswers = string.Join(
        ", ",
        Enum.GetNames<AttendanceAnswer>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<WhatsAppAnswer> builder)
    {
        builder.ToTable(
            "whatsapp_answer",
            table =>
                table.HasCheckConstraint(
                    "ck_whatsapp_answer_attendance",
                    $"attendance IN ({KnownAnswers})"
                )
        );
        builder.HasKey(answer => answer.Id);
        builder.Property(answer => answer.WhatsAppMessageId).HasColumnName("whatsapp_message_id");

        builder
            .Property(answer => answer.SenderId)
            .HasMaxLength(WhatsAppAnswer.SenderIdLength)
            .IsRequired();
        builder.Property(answer => answer.SenderName).HasMaxLength(WhatsAppAnswer.SenderNameLength);
        builder
            .Property(answer => answer.SenderPhone)
            .HasMaxLength(WhatsAppAnswer.SenderPhoneLength);
        builder
            .Property(answer => answer.PollOptionIds)
            .IsRequired()
            .HasDefaultValueSql(WhatsAppAddOnRules.EmptyArray);
        builder
            .Property(answer => answer.Attendance)
            .HasConversion<string>()
            .HasMaxLength(EnumLength);

        builder
            .HasOne(answer => answer.WhatsAppMessage)
            .WithMany()
            .HasForeignKey(answer => answer.WhatsAppMessageId)
            .HasConstraintName("fk_whatsapp_answer_whatsapp_message_whatsapp_message_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasOne(answer => answer.Person)
            .WithMany()
            .HasForeignKey(answer => answer.PersonId)
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasIndex(answer => new { answer.WhatsAppMessageId, answer.SenderId })
            .HasDatabaseName("ix_whatsapp_answer_whatsapp_message_id_sender_id")
            .IsUnique();
        builder.HasIndex(answer => answer.PersonId);
    }
}
