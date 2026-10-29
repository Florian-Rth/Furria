using Furria.Core.RunningOrders;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class ActWishConfiguration : IEntityTypeConfiguration<ActWish>
{
    private const int EnumLength = 32;

    private static readonly string KnownKinds = string.Join(
        ", ",
        RunningOrderRuleKinds.ActWishKinds.Order().Select(kind => $"'{kind}'")
    );

    private static readonly string KnownStrengths = string.Join(
        ", ",
        Enum.GetNames<RuleStrength>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<ActWish> builder)
    {
        builder.ToTable(
            "act_wish",
            table =>
            {
                table.HasCheckConstraint("ck_act_wish_kind", $"kind IN ({KnownKinds})");
                table.HasCheckConstraint("ck_act_wish_strength", $"strength IN ({KnownStrengths})");
            }
        );
        builder.HasKey(wish => wish.Id);

        builder.Property(wish => wish.Kind).HasConversion<string>().HasMaxLength(EnumLength);
        builder.Property(wish => wish.Strength).HasConversion<string>().HasMaxLength(EnumLength);

        builder
            .HasOne(wish => wish.Act)
            .WithMany(act => act.Wishes)
            .HasForeignKey(wish => wish.ActId)
            .HasConstraintName("fk_act_wish_act_act_id")
            .OnDelete(DeleteBehavior.Cascade);
        builder
            .HasIndex(wish => new { wish.ActId, wish.Kind })
            .HasDatabaseName("ix_act_wish_act_id_kind")
            .IsUnique();
    }
}
