using Furria.Core.RunningOrders;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class LiveDirectionConfiguration : IEntityTypeConfiguration<LiveDirection>
{
    public void Configure(EntityTypeBuilder<LiveDirection> builder)
    {
        builder.ToTable("live_direction");
        builder.HasKey(live => live.CalendarEntryId);
        builder.Property(live => live.CalendarEntryId).ValueGeneratedNever();
        builder.Property(live => live.MovedAt).IsConcurrencyToken();

        builder
            .HasOne(live => live.RunningOrder)
            .WithOne()
            .HasForeignKey<LiveDirection>(live => live.CalendarEntryId)
            .HasConstraintName("fk_live_direction_running_order_calendar_entry_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(live => live.Appearance)
            .WithMany()
            .HasForeignKey(live => live.AppearanceId)
            .HasConstraintName("fk_live_direction_appearance_appearance_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder
            .HasIndex(live => live.AppearanceId)
            .HasDatabaseName("ix_live_direction_appearance_id");
    }
}
