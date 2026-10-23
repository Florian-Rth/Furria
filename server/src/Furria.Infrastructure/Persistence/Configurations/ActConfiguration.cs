using Furria.Core.RunningOrders;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class ActConfiguration : IEntityTypeConfiguration<Act>
{
    private const int NameLength = 80;
    private const int EnumLength = 32;

    private static readonly string KnownKinds = string.Join(
        ", ",
        Enum.GetNames<ActKind>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<Act> builder)
    {
        builder.ToTable(
            "act",
            table =>
                table.HasCheckConstraint("ck_act_kind", $"kind IS NULL OR kind IN ({KnownKinds})")
        );
        builder.HasKey(act => act.Id);

        builder
            .Property(act => act.Name)
            .HasMaxLength(NameLength)
            .IsRequired()
            .UseCollation(GermanCollation.Name);
        builder.Property(act => act.Kind).HasConversion<string>().HasMaxLength(EnumLength);

        builder
            .HasOne(act => act.Group)
            .WithMany()
            .HasForeignKey(act => act.GroupId)
            .HasConstraintName("fk_act_group_group_id")
            .OnDelete(DeleteBehavior.SetNull);
        builder.HasIndex(act => act.GroupId).HasDatabaseName("ix_act_group_id");

        builder.Property(act => act.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(act => act.UpdatedAt).HasDefaultValueSql("now()");
    }
}
