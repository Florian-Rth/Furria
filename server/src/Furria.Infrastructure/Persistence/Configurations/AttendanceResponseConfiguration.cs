using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class AttendanceResponseConfiguration : IEntityTypeConfiguration<AttendanceResponse>
{
    private const int EnumLength = 32;

    private static readonly string KnownAnswers = string.Join(
        ", ",
        Enum.GetNames<AttendanceAnswer>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<AttendanceResponse> builder)
    {
        builder.ToTable(
            "attendance_response",
            table =>
                table.HasCheckConstraint(
                    "ck_attendance_response_answer",
                    $"answer IN ({KnownAnswers})"
                )
        );
        builder.HasKey(response => response.Id);

        builder
            .Property(response => response.Answer)
            .HasConversion<string>()
            .HasMaxLength(EnumLength);

        builder
            .HasOne(response => response.CalendarEntry)
            .WithMany()
            .HasForeignKey(response => response.CalendarEntryId)
            .HasConstraintName("fk_attendance_response_calendar_entry_calendar_entry_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(response => response.Person)
            .WithMany()
            .HasForeignKey(response => response.PersonId)
            .HasConstraintName("fk_attendance_response_person_person_id")
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasIndex(response => new { response.CalendarEntryId, response.PersonId })
            .HasDatabaseName("ix_attendance_response_calendar_entry_id_person_id")
            .IsUnique();

        builder.Property(response => response.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(response => response.UpdatedAt).HasDefaultValueSql("now()");
    }
}
