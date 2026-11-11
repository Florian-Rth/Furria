using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class CalendarSignUpLineConfiguration : IEntityTypeConfiguration<CalendarSignUpLine>
{
    private const int TextLength = 120;

    public void Configure(EntityTypeBuilder<CalendarSignUpLine> builder)
    {
        builder.ToTable(
            "calendar_sign_up_line",
            table =>
                table.HasCheckConstraint(
                    "ck_calendar_sign_up_line_text",
                    "text IS NULL OR btrim(text) <> ''"
                )
        );
        builder.HasKey(line => line.Id);

        builder.Property(line => line.Text).HasMaxLength(TextLength);

        builder
            .HasOne(line => line.SignUpList)
            .WithMany(list => list.Lines)
            .HasForeignKey(line => line.SignUpListId)
            .HasConstraintName("fk_calendar_sign_up_line_calendar_sign_up_list_sign_up_list_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(line => line.Person)
            .WithMany()
            .HasForeignKey(line => line.PersonId)
            .HasConstraintName("fk_calendar_sign_up_line_person_person_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasIndex(line => new { line.SignUpListId, line.PersonId })
            .HasDatabaseName("ix_calendar_sign_up_line_sign_up_list_id_person_id")
            .IsUnique();
        builder
            .HasIndex(line => line.PersonId)
            .HasDatabaseName("ix_calendar_sign_up_line_person_id");

        builder.Property(line => line.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(line => line.UpdatedAt).HasDefaultValueSql("now()");
    }
}
