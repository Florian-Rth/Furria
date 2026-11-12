using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class AnnouncementConfiguration : IEntityTypeConfiguration<Announcement>
{
    private const int TitleLength = 120;
    private const int BodyLength = 8_000;

    public void Configure(EntityTypeBuilder<Announcement> builder)
    {
        builder.ToTable(
            "announcement",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_announcement_attendance_position",
                    "attendance_position IS NULL OR attendance_position >= 0"
                );
                table.HasCheckConstraint(
                    "ck_announcement_attendance_state",
                    "attendance_position IS NOT NULL OR (answers_until IS NULL AND attendance_closed_at IS NULL AND attendance_closed_by_person_id IS NULL AND attendance_last_reminded_at IS NULL)"
                );
                table.HasCheckConstraint(
                    "ck_announcement_attendance_closer",
                    "attendance_closed_by_person_id IS NULL OR attendance_closed_at IS NOT NULL"
                );
            }
        );
        builder.HasKey(announcement => announcement.Id);

        builder.Property(announcement => announcement.Title).HasMaxLength(TitleLength).IsRequired();

        builder.Property(announcement => announcement.Body).HasMaxLength(BodyLength).IsRequired();

        builder
            .HasOne(announcement => announcement.Author)
            .WithMany()
            .HasForeignKey(announcement => announcement.AuthorPersonId)
            .HasConstraintName("fk_announcement_person_author_person_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder
            .HasOne(announcement => announcement.AttendanceClosedBy)
            .WithMany()
            .HasForeignKey(announcement => announcement.AttendanceClosedByPersonId)
            .HasConstraintName("fk_announcement_person_attendance_closed_by_person_id")
            .OnDelete(DeleteBehavior.SetNull);
        builder.HasIndex(announcement => announcement.AttendanceClosedByPersonId);

        builder.HasIndex(announcement => announcement.PublishedAt);
        builder.HasIndex(announcement => announcement.AuthorPersonId);

        builder.Property(announcement => announcement.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(announcement => announcement.UpdatedAt).HasDefaultValueSql("now()");
    }
}
