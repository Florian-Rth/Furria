using Furria.Core.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class MembershipConfiguration : IEntityTypeConfiguration<Membership>
{
    public void Configure(EntityTypeBuilder<Membership> builder)
    {
        builder.ToTable("membership");
        builder.HasKey(membership => membership.Id);

        builder.Property(membership => membership.Type).HasConversion<string>().HasMaxLength(32);
        builder.Property(membership => membership.Status).HasConversion<string>().HasMaxLength(32);
        builder.Property(membership => membership.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(membership => membership.UpdatedAt).HasDefaultValueSql("now()");

        builder.HasIndex(membership => membership.Status);

        builder
            .HasOne(membership => membership.Person)
            .WithOne(person => person.Membership)
            .HasForeignKey<Membership>(membership => membership.PersonId)
            .OnDelete(DeleteBehavior.Cascade)
            .HasConstraintName("fk_membership_person_person_id");
    }
}
