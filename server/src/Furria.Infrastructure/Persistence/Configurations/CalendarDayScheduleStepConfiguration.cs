using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class CalendarDayScheduleStepConfiguration
    : IEntityTypeConfiguration<CalendarDayScheduleStep>
{
    private const int TextLength = 120;

    public void Configure(EntityTypeBuilder<CalendarDayScheduleStep> builder)
    {
        builder.ToTable(
            "calendar_day_schedule_step",
            table =>
            {
                table.HasCheckConstraint("ck_calendar_day_schedule_step_day", "day >= 0");
                table.HasCheckConstraint("ck_calendar_day_schedule_step_text", "btrim(text) <> ''");
            }
        );
        builder.HasKey(step => step.Id);

        builder.Property(step => step.Text).HasMaxLength(TextLength).IsRequired();

        builder
            .HasOne(step => step.DaySchedule)
            .WithMany(schedule => schedule.Steps)
            .HasForeignKey(step => step.DayScheduleId)
            .HasConstraintName("fk_calendar_day_schedule_step_day_schedule_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasIndex(step => new
            {
                step.DayScheduleId,
                step.Day,
                step.Time,
            })
            .HasDatabaseName("ix_calendar_day_schedule_step_day_schedule_id_day_time");

        builder.Property(step => step.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(step => step.UpdatedAt).HasDefaultValueSql("now()");
    }
}
