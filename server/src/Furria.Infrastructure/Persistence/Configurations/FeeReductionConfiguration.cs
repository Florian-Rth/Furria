using Furria.Core.Club;
using Furria.Core.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class FeeReductionConfiguration : IEntityTypeConfiguration<FeeReduction>
{
    public void Configure(EntityTypeBuilder<FeeReduction> builder)
    {
        builder.ToTable(
            "fee_reduction",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_fee_reduction_span",
                    "last_session_year >= first_session_year"
                );
                table.HasCheckConstraint(
                    "ck_fee_reduction_founding",
                    $"first_session_year >= {ClubSession.FoundingYear}"
                );
            }
        );
        builder.HasKey(reduction => reduction.Id);

        builder.Property(reduction => reduction.Basis).HasConversion<string>().HasMaxLength(32);

        builder
            .HasOne(reduction => reduction.Person)
            .WithMany(person => person.FeeReductions)
            .HasForeignKey(reduction => reduction.PersonId)
            .HasConstraintName("fk_fee_reduction_person_person_id")
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(reduction => reduction.PersonId);

        builder.Property(reduction => reduction.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(reduction => reduction.UpdatedAt).HasDefaultValueSql("now()");
    }
}
