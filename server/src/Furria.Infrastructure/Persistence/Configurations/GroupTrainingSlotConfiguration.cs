using Furria.Core.Groups;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class GroupTrainingSlotConfiguration : IEntityTypeConfiguration<GroupTrainingSlot>
{
    private const int EnumLength = 32;
    private const int MaxDurationMinutes = 480;

    private static readonly string KnownWeekdays = string.Join(
        ", ",
        Enum.GetNames<DayOfWeek>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<GroupTrainingSlot> builder)
    {
        builder.ToTable(
            "group_training_slot",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_group_training_slot_duration",
                    $"duration_minutes > 0 AND duration_minutes <= {MaxDurationMinutes}"
                );
                table.HasCheckConstraint(
                    "ck_group_training_slot_weekday",
                    $"weekday IN ({KnownWeekdays})"
                );
            }
        );
        builder.HasKey(slot => slot.Id);

        builder.Property(slot => slot.Weekday).HasConversion<string>().HasMaxLength(EnumLength);

        builder
            .HasOne(slot => slot.Group)
            .WithMany(group => group.TrainingSlots)
            .HasForeignKey(slot => slot.GroupId)
            .HasConstraintName("fk_group_training_slot_group_group_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(slot => slot.Venue)
            .WithMany()
            .HasForeignKey(slot => slot.VenueId)
            .HasConstraintName("fk_group_training_slot_venue_venue_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(slot => slot.GroupId).HasDatabaseName("ix_group_training_slot_group_id");

        builder.Property(slot => slot.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(slot => slot.UpdatedAt).HasDefaultValueSql("now()");
    }
}
