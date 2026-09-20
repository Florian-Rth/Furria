using Furria.Core.Groups;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class GroupConfiguration : IEntityTypeConfiguration<Group>
{
    public void Configure(EntityTypeBuilder<Group> builder)
    {
        builder.ToTable("group");
        builder.HasKey(group => group.Id);

        builder
            .Property(group => group.Name)
            .HasMaxLength(80)
            .IsRequired()
            .UseCollation(GermanCollation.Name);
        builder.Property(group => group.Description).HasMaxLength(400).IsRequired();
        builder.Property(group => group.IsRecruiting).HasDefaultValue(false);

        builder
            .HasOne(group => group.GroupKind)
            .WithMany()
            .HasForeignKey(group => group.GroupKindId)
            .HasConstraintName("fk_group_group_kind_group_kind_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(group => group.Name).HasDatabaseName("ix_group_name_lookup");
        builder.HasIndex(group => group.GroupKindId).HasDatabaseName("ix_group_group_kind_id");

        builder.Property(group => group.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(group => group.UpdatedAt).HasDefaultValueSql("now()");
    }
}
