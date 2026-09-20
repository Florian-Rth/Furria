using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class VenueConfiguration : IEntityTypeConfiguration<Venue>
{
    private const int NameLength = 80;

    public void Configure(EntityTypeBuilder<Venue> builder)
    {
        builder.ToTable("venue");
        builder.HasKey(venue => venue.Id);

        builder
            .Property(venue => venue.Name)
            .HasMaxLength(NameLength)
            .IsRequired()
            .UseCollation(GermanCollation.Name);

        builder.HasIndex(venue => venue.Name).HasDatabaseName("ix_venue_name").IsUnique();

        builder.Property(venue => venue.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(venue => venue.UpdatedAt).HasDefaultValueSql("now()");
    }
}
