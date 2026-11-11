using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class CalendarEntryAudiencePersonConfiguration
    : IEntityTypeConfiguration<CalendarEntryAudiencePerson>
{
    public void Configure(EntityTypeBuilder<CalendarEntryAudiencePerson> builder)
    {
        builder.ToTable("calendar_entry_audience_person");
        builder.HasKey(link => link.Id);

        builder
            .HasOne(link => link.CalendarEntry)
            .WithMany(entry => entry.AudiencePeople)
            .HasForeignKey(link => link.CalendarEntryId)
            .HasConstraintName("fk_calendar_entry_audience_person_calendar_entry_calendar_entry_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(link => link.Person)
            .WithMany()
            .HasForeignKey(link => link.PersonId)
            .HasConstraintName("fk_calendar_entry_audience_person_person_person_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasIndex(link => new { link.CalendarEntryId, link.PersonId })
            .HasDatabaseName("ix_calendar_entry_audience_person_calendar_entry_id_person_id")
            .IsUnique();
        builder
            .HasIndex(link => link.PersonId)
            .HasDatabaseName("ix_calendar_entry_audience_person_person_id");

        builder.Property(link => link.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(link => link.UpdatedAt).HasDefaultValueSql("now()");
    }
}
