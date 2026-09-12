using Furria.Core.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class PersonConfiguration : IEntityTypeConfiguration<Person>
{
    public void Configure(EntityTypeBuilder<Person> builder)
    {
        builder.ToTable("person");
        builder.HasKey(person => person.Id);

        builder
            .Property(person => person.FirstName)
            .HasMaxLength(128)
            .IsRequired()
            .UseCollation(GermanCollation.Name);
        builder
            .Property(person => person.LastName)
            .HasMaxLength(128)
            .IsRequired()
            .UseCollation(GermanCollation.Name);
        builder.Property(person => person.Email).HasMaxLength(256);
        builder.Property(person => person.Phone).HasMaxLength(64);
        builder.Property(person => person.Street).HasMaxLength(256);
        builder.Property(person => person.Zip).HasMaxLength(16);
        builder.Property(person => person.City).HasMaxLength(128);
        builder.Property(person => person.ContactVisibleToMembers).HasDefaultValue(false);
        builder.Property(person => person.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(person => person.UpdatedAt).HasDefaultValueSql("now()");

        builder.HasIndex(person => new { person.LastName, person.FirstName });
    }
}
