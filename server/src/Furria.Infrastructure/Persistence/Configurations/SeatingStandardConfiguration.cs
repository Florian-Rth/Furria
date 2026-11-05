using Furria.Core.Halls;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class SeatingStandardConfiguration : IEntityTypeConfiguration<SeatingStandard>
{
    public void Configure(EntityTypeBuilder<SeatingStandard> builder)
    {
        builder.ToTable(
            "seating_standard",
            table =>
                table.HasCheckConstraint(
                    "ck_seating_standard_singleton",
                    $"id = {SeatingStandard.SingletonId}"
                )
        );
        builder.HasKey(standard => standard.Id);
        builder.Property(standard => standard.Id).ValueGeneratedNever();

        builder.Property(standard => standard.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(standard => standard.UpdatedAt).HasDefaultValueSql("now()");
    }
}
