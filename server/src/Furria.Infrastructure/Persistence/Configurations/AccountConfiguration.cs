using Furria.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.ToTable(
            "account",
            table =>
                table.HasCheckConstraint(
                    "ck_account_person_unless_managing_login",
                    "(person_id IS NULL) = is_managing_login"
                )
        );

        builder.Property(account => account.IsDisabled).HasDefaultValue(false);
        builder.Property(account => account.IsManagingLogin).HasDefaultValue(false);

        builder
            .HasIndex(account => account.IsManagingLogin)
            .IsUnique()
            .HasFilter("is_managing_login")
            .HasDatabaseName("ix_account_managing_login");

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
