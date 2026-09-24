using Furria.Core.Groups;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class GroupKindConfiguration : IEntityTypeConfiguration<GroupKind>
{
    private const int NameLength = 80;

    public void Configure(EntityTypeBuilder<GroupKind> builder)
    {
        builder.ToTable("group_kind");
        builder.HasKey(kind => kind.Id);

        builder
            .Property(kind => kind.Name)
            .HasMaxLength(NameLength)
            .IsRequired()
            .UseCollation(GermanCollation.Name);

        builder.HasIndex(kind => kind.Name).HasDatabaseName("ix_group_kind_name_lookup");

        builder.Property(kind => kind.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(kind => kind.UpdatedAt).HasDefaultValueSql("now()");
    }
}
