using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class CalendarDayScheduleConfiguration : IEntityTypeConfiguration<CalendarDaySchedule>
{
    private const int TitleLength = 120;

    public void Configure(EntityTypeBuilder<CalendarDaySchedule> builder)
    {
        builder.ToTable(
            "calendar_day_schedule",
            table =>
            {
                table.HasCheckConstraint("ck_calendar_day_schedule_position", "position >= 0");
                table.HasCheckConstraint(
                    "ck_calendar_day_schedule_title",
                    "title IS NULL OR btrim(title) <> ''"
                );
            }
        );
        builder.HasKey(schedule => schedule.Id);

        builder.Property(schedule => schedule.Title).HasMaxLength(TitleLength);

        builder
            .HasOne(schedule => schedule.CalendarEntry)
            .WithMany(entry => entry.DaySchedules)
            .HasForeignKey(schedule => schedule.CalendarEntryId)
            .HasConstraintName("fk_calendar_day_schedule_calendar_entry_calendar_entry_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasIndex(schedule => schedule.CalendarEntryId)
            .HasDatabaseName("ix_calendar_day_schedule_calendar_entry_id");

        builder.Property(schedule => schedule.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(schedule => schedule.UpdatedAt).HasDefaultValueSql("now()");
    }
}
