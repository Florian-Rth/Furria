using Furria.Core.Studio;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class AppearanceSpotConfiguration : IEntityTypeConfiguration<AppearanceSpot>
{
    public void Configure(EntityTypeBuilder<AppearanceSpot> builder)
    {
        builder.ToTable("appearance_spot");
        builder.HasKey(spot => new { spot.AppearanceId, spot.SpotId });

        builder
            .HasOne(spot => spot.Appearance)
            .WithMany()
            .HasForeignKey(spot => spot.AppearanceId)
            .HasConstraintName("fk_appearance_spot_appearance_appearance_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(spot => spot.Spot)
            .WithMany()
            .HasForeignKey(spot => spot.SpotId)
            .HasConstraintName("fk_appearance_spot_spot_spot_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(spot => spot.SpotId).HasDatabaseName("ix_appearance_spot_spot_id");

        builder
            .HasOne(spot => spot.Person)
            .WithMany()
            .HasForeignKey(spot => spot.PersonId)
            .HasConstraintName("fk_appearance_spot_person_person_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasIndex(spot => spot.PersonId).HasDatabaseName("ix_appearance_spot_person_id");
    }
}
