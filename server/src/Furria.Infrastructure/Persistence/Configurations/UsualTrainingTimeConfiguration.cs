using Furria.Core.Groups;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class UsualTrainingTimeConfiguration : IEntityTypeConfiguration<UsualTrainingTime>
{
    private const int EnumLength = 32;
    private const int MaxDurationMinutes = 480;

    private static readonly string KnownWeekdays = string.Join(
        ", ",
        Enum.GetNames<DayOfWeek>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<UsualTrainingTime> builder)
    {
        builder.ToTable(
            "usual_training_time",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_usual_training_time_duration",
                    $"duration_minutes > 0 AND duration_minutes <= {MaxDurationMinutes}"
                );
                table.HasCheckConstraint(
                    "ck_usual_training_time_weekday",
                    $"weekday IN ({KnownWeekdays})"
                );
            }
        );
        builder.HasKey(usualTime => usualTime.Id);

        builder
            .Property(usualTime => usualTime.Weekday)
            .HasConversion<string>()
            .HasMaxLength(EnumLength);

        builder
            .HasOne(usualTime => usualTime.Group)
            .WithMany(group => group.UsualTrainingTimes)
            .HasForeignKey(usualTime => usualTime.GroupId)
            .HasConstraintName("fk_usual_training_time_group_group_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(usualTime => usualTime.Venue)
            .WithMany()
            .HasForeignKey(usualTime => usualTime.VenueId)
            .HasConstraintName("fk_usual_training_time_venue_venue_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder
            .HasIndex(usualTime => usualTime.GroupId)
            .HasDatabaseName("ix_usual_training_time_group_id");

        builder.Property(usualTime => usualTime.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(usualTime => usualTime.UpdatedAt).HasDefaultValueSql("now()");
    }
}
