using Furria.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class AccountPasskeyConfiguration : IEntityTypeConfiguration<IdentityUserPasskey<int>>
{
    public void Configure(EntityTypeBuilder<IdentityUserPasskey<int>> builder)
    {
        builder.ToTable("account_passkey");

        builder
            .HasOne<Account>()
            .WithMany()
            .HasForeignKey(row => row.UserId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("fk_account_passkey_account_user_id");
    }
}
