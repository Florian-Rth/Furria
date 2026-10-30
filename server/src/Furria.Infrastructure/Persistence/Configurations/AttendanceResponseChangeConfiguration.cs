using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class AttendanceResponseChangeConfiguration
    : IEntityTypeConfiguration<AttendanceResponseChange>
{
    private const int EnumLength = 32;

    private static readonly string KnownAnswers = string.Join(
        ", ",
        Enum.GetNames<AttendanceAnswer>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<AttendanceResponseChange> builder)
    {
        builder.ToTable(
            "attendance_response_change",
            table =>
                table.HasCheckConstraint(
                    "ck_attendance_response_change_answer",
                    $"answer IN ({KnownAnswers})"
                )
        );
        builder.HasKey(change => change.Id);

        builder.Property(change => change.Answer).HasConversion<string>().HasMaxLength(EnumLength);
        builder.Property(change => change.RecordedAt).HasDefaultValueSql("now()");

        builder
            .HasOne(change => change.CalendarEntry)
            .WithMany()
            .HasForeignKey(change => change.CalendarEntryId)
            .HasConstraintName("fk_attendance_response_change_calendar_entry_calendar_entry_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(change => change.Person)
            .WithMany()
            .HasForeignKey(change => change.PersonId)
            .HasConstraintName("fk_attendance_response_change_person_person_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(change => change.RecordedBy)
            .WithMany()
            .HasForeignKey(change => change.RecordedByPersonId)
            .HasConstraintName("fk_attendance_response_change_person_recorded_by_person_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder
            .HasIndex(change => new { change.CalendarEntryId, change.PersonId })
            .HasDatabaseName("ix_attendance_response_change_calendar_entry_id_person_id");
        builder
            .HasIndex(change => change.PersonId)
            .HasDatabaseName("ix_attendance_response_change_person_id");
        builder
            .HasIndex(change => change.RecordedByPersonId)
            .HasDatabaseName("ix_attendance_response_change_recorded_by_person_id");
    }
}
