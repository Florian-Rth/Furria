using Furria.Core.Events;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class EventPresalePlaceConfiguration : IEntityTypeConfiguration<EventPresalePlace>
{
    public void Configure(EntityTypeBuilder<EventPresalePlace> builder)
    {
        builder.ToTable(
            "event_presale_place",
            table =>
                table.HasCheckConstraint("ck_event_presale_place_sort_order", "sort_order >= 0")
        );
        builder.HasKey(place => new { place.EventId, place.VenueId });

        builder
            .HasOne(place => place.Event)
            .WithMany(held => held.PresalePlaces)
            .HasForeignKey(place => place.EventId)
            .HasConstraintName("fk_event_presale_place_event_event_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(place => place.Venue)
            .WithMany()
            .HasForeignKey(place => place.VenueId)
            .HasConstraintName("fk_event_presale_place_venue_venue_id")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(place => place.VenueId).HasDatabaseName("ix_event_presale_place_venue_id");
    }
}
