using Furria.Core.RunningOrders;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class RunningOrderConfiguration : IEntityTypeConfiguration<RunningOrder>
{
    public void Configure(EntityTypeBuilder<RunningOrder> builder)
    {
        builder.ToTable("running_order");
        builder.HasKey(order => order.CalendarEntryId);
        builder.Property(order => order.CalendarEntryId).ValueGeneratedNever();
        builder.Property(order => order.Version).IsConcurrencyToken();

        builder
            .HasOne(order => order.CalendarEntry)
            .WithOne()
            .HasForeignKey<RunningOrder>(order => order.CalendarEntryId)
            .HasConstraintName("fk_running_order_calendar_entry_calendar_entry_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(order => order.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(order => order.UpdatedAt).HasDefaultValueSql("now()");
    }
}
