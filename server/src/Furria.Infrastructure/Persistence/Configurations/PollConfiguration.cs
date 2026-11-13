using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class PollConfiguration : IEntityTypeConfiguration<Poll>
{
    private const int QuestionLength = 200;

    public void Configure(EntityTypeBuilder<Poll> builder)
    {
        builder.ToTable(
            "poll",
            table =>
            {
                table.HasCheckConstraint("ck_poll_position", "position >= 0");
                table.HasCheckConstraint("ck_poll_question", "btrim(question) <> ''");
                table.HasCheckConstraint("ck_poll_one_host", AddOnHostConstraint.OneHost);
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
            .HasConstraintName("fk_poll_calendar_entry_calendar_entry_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(poll => poll.CalendarEntryId).HasDatabaseName("ix_poll_calendar_entry_id");

        builder
            .HasOne(poll => poll.Announcement)
            .WithMany(announcement => announcement.Polls)
            .HasForeignKey(poll => poll.AnnouncementId)
            .HasConstraintName("fk_poll_announcement_announcement_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(poll => poll.AnnouncementId).HasDatabaseName("ix_poll_announcement_id");

        builder
            .HasOne(poll => poll.ClosedBy)
            .WithMany()
            .HasForeignKey(poll => poll.ClosedByPersonId)
            .HasConstraintName("fk_poll_person_closed_by_person_id")
            .OnDelete(DeleteBehavior.SetNull);
        builder
            .HasIndex(poll => poll.ClosedByPersonId)
            .HasDatabaseName("ix_poll_closed_by_person_id");

        builder.Property(poll => poll.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(poll => poll.UpdatedAt).HasDefaultValueSql("now()");
    }
}
