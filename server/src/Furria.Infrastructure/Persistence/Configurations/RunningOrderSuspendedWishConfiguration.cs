using Furria.Core.RunningOrders;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class RunningOrderSuspendedWishConfiguration
    : IEntityTypeConfiguration<RunningOrderSuspendedWish>
{
    public void Configure(EntityTypeBuilder<RunningOrderSuspendedWish> builder)
    {
        builder.ToTable("running_order_suspended_wish");
        builder.HasKey(suspended => new { suspended.CalendarEntryId, suspended.ActWishId });

        builder
            .HasOne(suspended => suspended.RunningOrder)
            .WithMany(order => order.SuspendedWishes)
            .HasForeignKey(suspended => suspended.CalendarEntryId)
            .HasConstraintName("fk_running_order_suspended_wish_running_order_calendar_entry_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(suspended => suspended.ActWish)
            .WithMany()
            .HasForeignKey(suspended => suspended.ActWishId)
            .HasConstraintName("fk_running_order_suspended_wish_act_wish_act_wish_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasIndex(suspended => suspended.ActWishId)
            .HasDatabaseName("ix_running_order_suspended_wish_act_wish_id");
    }
}
