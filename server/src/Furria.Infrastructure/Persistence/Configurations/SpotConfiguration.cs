using Furria.Core.Studio;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class SpotConfiguration : IEntityTypeConfiguration<Spot>
{
    public void Configure(EntityTypeBuilder<Spot> builder)
    {
        builder.ToTable("spot", table => table.HasCheckConstraint("ck_spot_number", "number >= 1"));
        builder.HasKey(spot => spot.Id);

        builder
            .HasOne(spot => spot.Act)
            .WithMany()
            .HasForeignKey(spot => spot.ActId)
            .HasConstraintName("fk_spot_act_act_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasIndex(spot => new { spot.ActId, spot.Number })
            .HasDatabaseName("ix_spot_act_id_number")
            .IsUnique();

        builder
            .HasOne(spot => spot.Person)
            .WithMany()
            .HasForeignKey(spot => spot.PersonId)
            .HasConstraintName("fk_spot_person_person_id")
            .OnDelete(DeleteBehavior.SetNull);
        builder
            .HasIndex(spot => new { spot.ActId, spot.PersonId })
            .HasDatabaseName("ix_spot_act_id_person_id")
            .HasFilter("person_id IS NOT NULL")
            .IsUnique();
        builder.HasIndex(spot => spot.PersonId).HasDatabaseName("ix_spot_person_id");
    }
}
