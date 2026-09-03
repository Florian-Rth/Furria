using Furria.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.ToTable("account");

        builder.Property(account => account.IsDisabled).HasDefaultValue(false);

        builder.HasIndex(account => account.PersonId).IsUnique();

        builder
            .HasIndex(account => account.NormalizedUserName)
            .IsUnique()
            .HasDatabaseName("ix_account_normalized_user_name");

        builder
            .HasIndex(account => account.NormalizedEmail)
            .IsUnique()
            .HasDatabaseName("ix_account_normalized_email");

        builder
            .HasOne(account => account.Person)
            .WithOne()
            .HasForeignKey<Account>(account => account.PersonId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("fk_account_person_person_id");
    }
}
