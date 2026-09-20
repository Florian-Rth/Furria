using Furria.Core.Club;
using Furria.Core.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class MembershipPauseConfiguration : IEntityTypeConfiguration<MembershipPause>
{
    public void Configure(EntityTypeBuilder<MembershipPause> builder)
    {
        builder.ToTable(
            "membership_pause",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_membership_pause_span",
                    "last_session_year IS NULL OR last_session_year >= first_session_year"
                );
                table.HasCheckConstraint(
                    "ck_membership_pause_founding",
                    $"first_session_year >= {ClubSession.EarliestSessionYear}"
                );
            }
        );
        builder.HasKey(pause => pause.Id);

        builder
            .HasOne(pause => pause.Membership)
            .WithMany(membership => membership.Pauses)
            .HasForeignKey(pause => pause.MembershipId)
            .HasConstraintName("fk_membership_pause_membership_membership_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(pause => pause.MembershipId);

        builder.Property(pause => pause.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(pause => pause.UpdatedAt).HasDefaultValueSql("now()");
    }
}
