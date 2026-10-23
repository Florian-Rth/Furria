using Furria.Core.RunningOrders;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class RunningOrderLineConfiguration : IEntityTypeConfiguration<RunningOrderLine>
{
    public void Configure(EntityTypeBuilder<RunningOrderLine> builder)
    {
        builder.ToTable(
            "running_order_line",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_running_order_line_position",
                    "position IS NULL OR position >= 0"
                );
            }
        );
        builder.HasKey(line => line.Id);

        builder
            .HasOne(line => line.RunningOrder)
            .WithMany(order => order.Lines)
            .HasForeignKey(line => line.CalendarEntryId)
            .HasConstraintName("fk_running_order_line_running_order_calendar_entry_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(line => line.Act)
            .WithMany()
            .HasForeignKey(line => line.ActId)
            .HasConstraintName("fk_running_order_line_act_act_id")
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasIndex(line => new { line.CalendarEntryId, line.ActId })
            .HasDatabaseName("ix_running_order_line_calendar_entry_id_act_id")
            .IsUnique();
        builder.HasIndex(line => line.ActId).HasDatabaseName("ix_running_order_line_act_id");
    }
}
