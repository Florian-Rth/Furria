using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class VenueConfiguration : IEntityTypeConfiguration<Venue>
{
    private const int NameLength = 80;
    private const int StreetLength = 120;
    private const int ZipLength = 10;
    private const int CityLength = 80;
    private const int HintLength = 200;

    public void Configure(EntityTypeBuilder<Venue> builder)
    {
        builder.ToTable("venue");
        builder.HasKey(venue => venue.Id);

        builder
            .Property(venue => venue.Name)
            .HasMaxLength(NameLength)
            .IsRequired()
            .UseCollation(GermanCollation.Name);
        builder.Property(venue => venue.Street).HasMaxLength(StreetLength).IsRequired();
        builder.Property(venue => venue.Zip).HasMaxLength(ZipLength).IsRequired();
        builder
            .Property(venue => venue.City)
            .HasMaxLength(CityLength)
            .IsRequired()
            .UseCollation(GermanCollation.Name);
        builder.Property(venue => venue.Hint).HasMaxLength(HintLength);

        builder.HasIndex(venue => venue.Name).HasDatabaseName("ix_venue_name").IsUnique();

        builder.Property(venue => venue.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(venue => venue.UpdatedAt).HasDefaultValueSql("now()");
    }
}
