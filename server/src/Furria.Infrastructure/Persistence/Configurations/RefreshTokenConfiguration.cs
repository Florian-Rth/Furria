using Furria.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable(
            "refresh_token",
            table =>
            {
                table.HasCheckConstraint("ck_refresh_token_expiry", "expires_at > created_at");
                table.HasCheckConstraint(
                    "ck_refresh_token_revocation",
                    "(revoked_at IS NULL) = (revoked_reason IS NULL)"
                );
            }
        );

        builder.HasKey(token => token.Id);
        builder.Property(token => token.Id).ValueGeneratedNever();

        builder.Property(token => token.TokenHash).HasMaxLength(43).IsRequired();
        builder.Property(token => token.RevokedReason).HasConversion<string>().HasMaxLength(32);

        builder.HasIndex(token => token.TokenHash).IsUnique();
        builder.HasIndex(token => token.FamilyId);
        builder.HasIndex(token => token.AccountId);
        builder.HasIndex(token => token.ExpiresAt);

        builder.HasIndex(token => token.ReplacedById).IsUnique();

        builder
            .HasOne(token => token.Account)
            .WithMany()
            .HasForeignKey(token => token.AccountId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
