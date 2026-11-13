using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class AnnouncementBorrowedAddOnConfiguration
    : IEntityTypeConfiguration<AnnouncementBorrowedAddOn>
{
    private const int EnumLength = 32;

    public void Configure(EntityTypeBuilder<AnnouncementBorrowedAddOn> builder)
    {
        builder.ToTable(
            "announcement_borrowed_add_on",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_announcement_borrowed_add_on_kind_matches_target",
                    "(kind = 'Attendance' AND poll_id IS NULL AND sign_up_list_id IS NULL)"
                        + " OR (kind = 'Poll' AND poll_id IS NOT NULL AND sign_up_list_id IS NULL)"
                        + " OR (kind = 'SignUpList' AND sign_up_list_id IS NOT NULL AND poll_id IS NULL)"
                );
                table.HasCheckConstraint(
                    "ck_announcement_borrowed_add_on_position_not_negative",
                    "position >= 0"
                );
            }
        );
        builder.HasKey(borrowed => borrowed.Id);

        builder
            .Property(borrowed => borrowed.Kind)
            .HasConversion<string>()
            .HasMaxLength(EnumLength);

        builder
            .HasOne(borrowed => borrowed.Announcement)
            .WithMany(announcement => announcement.BorrowedAddOns)
            .HasForeignKey(borrowed => borrowed.AnnouncementId)
            .HasConstraintName("fk_announcement_borrowed_add_on_announcement_announcement_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(borrowed => borrowed.CalendarEntry)
            .WithMany()
            .HasForeignKey(borrowed => borrowed.CalendarEntryId)
            .HasConstraintName("fk_announcement_borrowed_add_on_entry_calendar_entry_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(borrowed => borrowed.Poll)
            .WithMany()
            .HasForeignKey(borrowed => borrowed.PollId)
            .HasConstraintName("fk_announcement_borrowed_add_on_poll_poll_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(borrowed => borrowed.SignUpList)
            .WithMany()
            .HasForeignKey(borrowed => borrowed.SignUpListId)
            .HasConstraintName("fk_announcement_borrowed_add_on_sign_up_list_sign_up_list_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasIndex(borrowed => new { borrowed.AnnouncementId, borrowed.CalendarEntryId })
            .HasFilter("kind = 'Attendance'")
            .IsUnique();
        builder
            .HasIndex(borrowed => new { borrowed.AnnouncementId, borrowed.PollId })
            .HasFilter("poll_id IS NOT NULL")
            .IsUnique();
        builder
            .HasIndex(borrowed => new { borrowed.AnnouncementId, borrowed.SignUpListId })
            .HasFilter("sign_up_list_id IS NOT NULL")
            .IsUnique();
        builder.HasIndex(borrowed => borrowed.CalendarEntryId);
        builder.HasIndex(borrowed => borrowed.PollId);
        builder.HasIndex(borrowed => borrowed.SignUpListId);
    }
}
