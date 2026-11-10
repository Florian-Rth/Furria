using Furria.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class ClaimWindowConfiguration : IEntityTypeConfiguration<ClaimWindow>
{
    public void Configure(EntityTypeBuilder<ClaimWindow> builder)
    {
        builder.ToTable(
            "claim_window",
            table =>
            {
                table.HasCheckConstraint("ck_claim_window_end", "closes_at > opened_at");
                table.HasCheckConstraint(
                    "ck_claim_window_closed_after_opening",
                    "closed_at IS NULL OR closed_at >= opened_at"
                );
            }
        );
        builder.HasKey(window => window.Id);

        builder.HasIndex(window => window.OpenedAt);
        builder.HasIndex(window => window.OpenedByPersonId);

        builder
            .HasOne(window => window.OpenedBy)
            .WithMany()
            .HasForeignKey(window => window.OpenedByPersonId)
            .HasConstraintName("fk_claim_window_person_opened_by_person_id")
            .OnDelete(DeleteBehavior.SetNull);
    }
}
