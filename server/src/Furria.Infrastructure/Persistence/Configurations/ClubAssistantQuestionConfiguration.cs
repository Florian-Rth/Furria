using Furria.Core.Assistant;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class ClubAssistantQuestionConfiguration
    : IEntityTypeConfiguration<ClubAssistantQuestion>
{
    public void Configure(EntityTypeBuilder<ClubAssistantQuestion> builder)
    {
        builder.ToTable(
            "club_assistant_question",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_club_assistant_question_answer",
                    "(answer IS NULL) = (answered_at IS NULL)"
                );
                table.HasCheckConstraint(
                    "ck_club_assistant_question_last_message",
                    "last_message_at >= asked_at"
                );
            }
        );
        builder.HasKey(question => question.Id);
        builder
            .Property(question => question.ChatId)
            .HasMaxLength(ClubAssistantQuestion.ChatIdLength)
            .IsRequired();
        builder
            .Property(question => question.Text)
            .HasMaxLength(ClubAssistantQuestion.LongestText)
            .IsRequired();
        builder
            .Property(question => question.Answer)
            .HasMaxLength(ClubAssistantQuestion.LongestAnswer);

        builder
            .HasOne(question => question.Person)
            .WithMany()
            .HasForeignKey(question => question.PersonId)
            .HasConstraintName("fk_club_assistant_question_person_person_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(question => new { question.PersonId, question.AskedAt });
        builder.HasIndex(question => question.AskedAt);
    }
}
