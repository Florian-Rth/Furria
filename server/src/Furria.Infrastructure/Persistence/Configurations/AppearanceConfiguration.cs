using Furria.Core.RunningOrders;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class AppearanceConfiguration : IEntityTypeConfiguration<Appearance>
{
    public void Configure(EntityTypeBuilder<Appearance> builder)
    {
        builder.ToTable(
            "appearance",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_appearance_position",
                    "position IS NULL OR position >= 0"
                );
            }
        );
        builder.HasKey(appearance => appearance.Id);

        builder
            .HasOne(appearance => appearance.CalendarEntry)
            .WithMany()
            .HasForeignKey(appearance => appearance.CalendarEntryId)
            .HasConstraintName("fk_appearance_calendar_entry_calendar_entry_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(appearance => appearance.Act)
            .WithMany()
            .HasForeignKey(appearance => appearance.ActId)
            .HasConstraintName("fk_appearance_act_act_id")
            .OnDelete(DeleteBehavior.Restrict);

        builder
            .HasIndex(appearance => new { appearance.CalendarEntryId, appearance.ActId })
            .HasDatabaseName("ix_appearance_calendar_entry_id_act_id")
            .IsUnique();
        builder.HasIndex(appearance => appearance.ActId).HasDatabaseName("ix_appearance_act_id");
    }
}
