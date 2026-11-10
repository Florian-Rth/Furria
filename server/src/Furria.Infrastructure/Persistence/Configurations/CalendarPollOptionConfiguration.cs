using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class CalendarPollOptionConfiguration : IEntityTypeConfiguration<CalendarPollOption>
{
    private const int LabelLength = 120;

    public void Configure(EntityTypeBuilder<CalendarPollOption> builder)
    {
        builder.ToTable(
            "calendar_poll_option",
            table =>
            {
                table.HasCheckConstraint("ck_calendar_poll_option_position", "position >= 0");
                table.HasCheckConstraint("ck_calendar_poll_option_label", "btrim(label) <> ''");
            }
        );
        builder.HasKey(option => option.Id);
        builder
            .HasAlternateKey(option => new { option.PollId, option.Id })
            .HasName("ak_calendar_poll_option_poll_id_id");

        builder.Property(option => option.Label).HasMaxLength(LabelLength).IsRequired();

        builder
            .HasOne(option => option.Poll)
            .WithMany(poll => poll.Options)
            .HasForeignKey(option => option.PollId)
            .HasConstraintName("fk_calendar_poll_option_calendar_poll_poll_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(option => option.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(option => option.UpdatedAt).HasDefaultValueSql("now()");
    }
}
