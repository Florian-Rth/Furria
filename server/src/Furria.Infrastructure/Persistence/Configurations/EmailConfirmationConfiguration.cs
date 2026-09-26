using Furria.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class EmailConfirmationConfiguration : IEntityTypeConfiguration<EmailConfirmation>
{
    public const string LiveConfirmationIndex = "ix_email_confirmation_subject_live";

    private const int NormalizedEmailLength = 256;

    public void Configure(EntityTypeBuilder<EmailConfirmation> builder)
    {
        builder.ToTable(
            "email_confirmation",
            table =>
            {
                table.HasCheckConstraint("ck_email_confirmation_expiry", "expires_at > issued_at");
                table.HasCheckConstraint(
                    "ck_email_confirmation_single_ending",
                    "consumed_at IS NULL OR voided_at IS NULL"
                );
                table.HasCheckConstraint(
                    "ck_email_confirmation_failed_attempts",
                    $"failed_attempts BETWEEN 0 AND {EmailConfirmation.MaxFailedAttempts}"
                );
                table.HasCheckConstraint(
                    "ck_email_confirmation_redemption_subject",
                    "purpose <> 'InvitationRedemption' OR invitation_id IS NOT NULL"
                );
            }
        );
        builder.HasKey(confirmation => confirmation.Id);

        builder
            .Property(confirmation => confirmation.Purpose)
            .HasConversion<string>()
            .HasMaxLength(32);
        builder
            .Property(confirmation => confirmation.NormalizedEmail)
            .HasMaxLength(NormalizedEmailLength)
            .IsRequired();
        builder
            .Property(confirmation => confirmation.CodeHash)
            .HasMaxLength(EmailConfirmation.CodeHashLength)
            .IsRequired();
        builder.Property(confirmation => confirmation.FailedAttempts).HasDefaultValue(0);

        builder
            .HasIndex(confirmation => new { confirmation.Purpose, confirmation.InvitationId })
            .HasDatabaseName(LiveConfirmationIndex)
            .IsUnique()
            .HasFilter("invitation_id IS NOT NULL AND consumed_at IS NULL AND voided_at IS NULL");
        builder.HasIndex(confirmation => confirmation.InvitationId);

        builder
            .HasOne(confirmation => confirmation.Invitation)
            .WithMany()
            .HasForeignKey(confirmation => confirmation.InvitationId)
            .HasConstraintName("fk_email_confirmation_invitation_invitation_id")
            .OnDelete(DeleteBehavior.Cascade);
    }
}
