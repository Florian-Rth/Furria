using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class CalendarPollConfiguration : IEntityTypeConfiguration<CalendarPoll>
{
    private const int QuestionLength = 200;

    public void Configure(EntityTypeBuilder<CalendarPoll> builder)
    {
        builder.ToTable(
            "calendar_poll",
            table =>
            {
                table.HasCheckConstraint("ck_calendar_poll_position", "position >= 0");
                table.HasCheckConstraint("ck_calendar_poll_question", "btrim(question) <> ''");
            }
        );
        builder.HasKey(poll => poll.Id);

        builder.Property(poll => poll.Question).HasMaxLength(QuestionLength).IsRequired();
        builder.Property(poll => poll.AllowsMultipleChoices).HasDefaultValue(false);
        builder.Property(poll => poll.IsAnonymous).HasDefaultValue(false);

        builder
            .HasOne(poll => poll.CalendarEntry)
            .WithMany(entry => entry.Polls)
            .HasForeignKey(poll => poll.CalendarEntryId)
            .HasConstraintName("fk_calendar_poll_calendar_entry_calendar_entry_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasIndex(poll => poll.CalendarEntryId)
            .HasDatabaseName("ix_calendar_poll_calendar_entry_id");

        builder
            .HasOne(poll => poll.ClosedBy)
            .WithMany()
            .HasForeignKey(poll => poll.ClosedByPersonId)
            .HasConstraintName("fk_calendar_poll_person_closed_by_person_id")
            .OnDelete(DeleteBehavior.SetNull);
        builder
            .HasIndex(poll => poll.ClosedByPersonId)
            .HasDatabaseName("ix_calendar_poll_closed_by_person_id");

        builder.Property(poll => poll.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(poll => poll.UpdatedAt).HasDefaultValueSql("now()");
    }
}
