using Furria.Core.MembershipApplications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class MembershipApplicationConfiguration
    : IEntityTypeConfiguration<MembershipApplication>
{
    public void Configure(EntityTypeBuilder<MembershipApplication> builder)
    {
        builder.ToTable(
            "membership_application",
            table =>
                table.HasCheckConstraint(
                    "ck_membership_application_confirmed_after_submission",
                    "confirmed_at IS NULL OR confirmed_at >= submitted_at"
                )
        );
        builder.HasKey(application => application.Id);

        builder
            .Property(application => application.FirstName)
            .HasMaxLength(MembershipApplication.NameLength)
            .IsRequired()
            .UseCollation(GermanCollation.Name);
        builder
            .Property(application => application.LastName)
            .HasMaxLength(MembershipApplication.NameLength)
            .IsRequired()
            .UseCollation(GermanCollation.Name);
        builder
            .Property(application => application.Street)
            .HasMaxLength(MembershipApplication.StreetLength)
            .IsRequired();
        builder
            .Property(application => application.Zip)
            .HasMaxLength(MembershipApplication.ZipLength)
            .IsRequired();
        builder
            .Property(application => application.City)
            .HasMaxLength(MembershipApplication.CityLength)
            .IsRequired();
        builder
            .Property(application => application.Email)
            .HasMaxLength(MembershipApplication.EmailLength)
            .IsRequired();
        builder
            .Property(application => application.Phone)
            .HasMaxLength(MembershipApplication.PhoneLength);
        builder
            .Property(application => application.ConfirmationTokenHash)
            .HasMaxLength(MembershipApplication.TokenHashLength)
            .IsRequired();

        builder.HasIndex(application => application.ConfirmationTokenHash).IsUnique();
        builder.HasIndex(application => application.SubmittedAt).HasFilter("confirmed_at IS NULL");
    }
}
