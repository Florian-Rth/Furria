using Furria.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class PasskeyChallengeConfiguration : IEntityTypeConfiguration<PasskeyChallenge>
{
    public void Configure(EntityTypeBuilder<PasskeyChallenge> builder)
    {
        builder.ToTable(
            "passkey_challenge",
            table =>
            {
                table.HasCheckConstraint("ck_passkey_challenge_expiry", "expires_at > issued_at");
                table.HasCheckConstraint(
                    "ck_passkey_challenge_creation_subject",
                    "(purpose = 'Creation') = (account_id IS NOT NULL)"
                );
            }
        );
        builder.HasKey(challenge => challenge.Id);

        builder.Property(challenge => challenge.Purpose).HasConversion<string>().HasMaxLength(16);
        builder
            .Property(challenge => challenge.IdHash)
            .HasMaxLength(PasskeyChallenge.IdHashLength)
            .IsRequired();
        builder.Property(challenge => challenge.State).IsRequired();

        builder.HasIndex(challenge => challenge.IdHash).IsUnique();
        builder.HasIndex(challenge => challenge.ExpiresAt);
        builder.HasIndex(challenge => challenge.AccountId);

        builder
            .HasOne(challenge => challenge.Account)
            .WithMany()
            .HasForeignKey(challenge => challenge.AccountId)
            .HasConstraintName("fk_passkey_challenge_account_account_id")
            .OnDelete(DeleteBehavior.Cascade);
    }
}
