using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class CalendarEntryGroupConfiguration : IEntityTypeConfiguration<CalendarEntryGroup>
{
    public void Configure(EntityTypeBuilder<CalendarEntryGroup> builder)
    {
        builder.ToTable("calendar_entry_group");
        builder.HasKey(link => link.Id);

        builder
            .HasOne(link => link.CalendarEntry)
            .WithMany(entry => entry.ParticipatingGroups)
            .HasForeignKey(link => link.CalendarEntryId)
            .HasConstraintName("fk_calendar_entry_group_calendar_entry_calendar_entry_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(link => link.Group)
            .WithMany()
            .HasForeignKey(link => link.GroupId)
            .HasConstraintName("fk_calendar_entry_group_group_group_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasIndex(link => new { link.CalendarEntryId, link.GroupId })
            .HasDatabaseName("ix_calendar_entry_group_calendar_entry_id_group_id")
            .IsUnique();
        builder.HasIndex(link => link.GroupId).HasDatabaseName("ix_calendar_entry_group_group_id");

        builder.Property(link => link.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(link => link.UpdatedAt).HasDefaultValueSql("now()");
    }
}
