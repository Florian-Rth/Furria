using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class CalendarSignUpListConfiguration : IEntityTypeConfiguration<CalendarSignUpList>
{
    private const int TitleLength = 120;
    private const int HintLength = 300;

    public void Configure(EntityTypeBuilder<CalendarSignUpList> builder)
    {
        builder.ToTable(
            "calendar_sign_up_list",
            table =>
            {
                table.HasCheckConstraint("ck_calendar_sign_up_list_position", "position >= 0");
                table.HasCheckConstraint("ck_calendar_sign_up_list_title", "btrim(title) <> ''");
                table.HasCheckConstraint(
                    "ck_calendar_sign_up_list_hint",
                    "hint IS NULL OR btrim(hint) <> ''"
                );
            }
        );
        builder.HasKey(list => list.Id);

        builder.Property(list => list.Title).HasMaxLength(TitleLength).IsRequired();
        builder.Property(list => list.Hint).HasMaxLength(HintLength);

        builder
            .HasOne(list => list.CalendarEntry)
            .WithMany(entry => entry.SignUpLists)
            .HasForeignKey(list => list.CalendarEntryId)
            .HasConstraintName("fk_calendar_sign_up_list_calendar_entry_calendar_entry_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasIndex(list => list.CalendarEntryId)
            .HasDatabaseName("ix_calendar_sign_up_list_calendar_entry_id");

        builder.Property(list => list.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(list => list.UpdatedAt).HasDefaultValueSql("now()");
    }
}
