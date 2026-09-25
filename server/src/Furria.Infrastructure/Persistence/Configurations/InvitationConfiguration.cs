using Furria.Core.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class InvitationConfiguration : IEntityTypeConfiguration<Invitation>
{
    public const string LiveInvitationIndex = "ix_invitation_person_id_live";

    public void Configure(EntityTypeBuilder<Invitation> builder)
    {
        builder.ToTable(
            "invitation",
            table =>
            {
                table.HasCheckConstraint("ck_invitation_expiry", "expires_at > issued_at");
                table.HasCheckConstraint(
                    "ck_invitation_single_ending",
                    "redeemed_at IS NULL OR voided_at IS NULL"
                );
                table.HasCheckConstraint(
                    "ck_invitation_code_in_person_only",
                    "code_hash IS NULL OR channel = 'InPerson'"
                );
            }
        );
        builder.HasKey(invitation => invitation.Id);

        builder.Property(invitation => invitation.Purpose).HasConversion<string>().HasMaxLength(16);
        builder.Property(invitation => invitation.Channel).HasConversion<string>().HasMaxLength(16);
        builder
            .Property(invitation => invitation.TokenHash)
            .HasMaxLength(Invitation.TokenHashLength)
            .IsRequired();
        builder
            .Property(invitation => invitation.CodeHash)
            .HasMaxLength(Invitation.TokenHashLength);
        builder.Property(invitation => invitation.IsReminder).HasDefaultValue(false);

        builder.HasIndex(invitation => invitation.TokenHash).IsUnique();
        builder.HasIndex(invitation => invitation.PersonId);
        builder.HasIndex(invitation => invitation.IssuedByPersonId);
        builder
            .HasIndex(invitation => invitation.PersonId, LiveInvitationIndex)
            .HasDatabaseName(LiveInvitationIndex)
            .IsUnique()
            .HasFilter("redeemed_at IS NULL AND voided_at IS NULL");

        builder
            .HasOne(invitation => invitation.Person)
            .WithMany()
            .HasForeignKey(invitation => invitation.PersonId)
            .HasConstraintName("fk_invitation_person_person_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(invitation => invitation.IssuedBy)
            .WithMany()
            .HasForeignKey(invitation => invitation.IssuedByPersonId)
            .HasConstraintName("fk_invitation_person_issued_by_person_id")
            .OnDelete(DeleteBehavior.SetNull);
    }
}
