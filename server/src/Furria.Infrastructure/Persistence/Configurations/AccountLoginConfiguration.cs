using Furria.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class AccountLoginConfiguration : IEntityTypeConfiguration<IdentityUserLogin<int>>
{
    public void Configure(EntityTypeBuilder<IdentityUserLogin<int>> builder)
    {
        builder.ToTable("account_login");

        builder
            .HasOne<Account>()
            .WithMany()
            .HasForeignKey(row => row.UserId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("fk_account_login_account_user_id");
    }
}
