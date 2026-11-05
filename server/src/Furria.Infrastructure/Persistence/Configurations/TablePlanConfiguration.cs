using Furria.Core.Halls;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class TablePlanConfiguration : IEntityTypeConfiguration<TablePlan>
{
    public void Configure(EntityTypeBuilder<TablePlan> builder)
    {
        builder.ToTable(
            "table_plan",
            table =>
                table.HasCheckConstraint(
                    "ck_table_plan_document_shape",
                    "jsonb_typeof(document) = 'object' "
                        + "AND jsonb_typeof(document -> 'rows') = 'array' "
                        + "AND jsonb_typeof(document -> 'groups') = 'array'"
                )
        );
        builder.HasKey(plan => plan.CalendarEntryId);
        builder.Property(plan => plan.CalendarEntryId).ValueGeneratedNever();
        builder.Property(plan => plan.Version).IsConcurrencyToken();
        PlanDocumentColumn.Configure(
            builder.Property(plan => plan.Document),
            TablePlanDocument.Empty
        );

        builder
            .HasOne(plan => plan.Event)
            .WithOne()
            .HasForeignKey<TablePlan>(plan => plan.CalendarEntryId)
            .HasConstraintName("fk_table_plan_event_calendar_entry_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasOne(plan => plan.Hall)
            .WithMany()
            .HasForeignKey(plan => plan.HallId)
            .HasConstraintName("fk_table_plan_hall_hall_id")
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(plan => plan.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(plan => plan.UpdatedAt).HasDefaultValueSql("now()");
    }
}
