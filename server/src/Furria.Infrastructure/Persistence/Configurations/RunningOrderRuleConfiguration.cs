using Furria.Core.RunningOrders;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class RunningOrderRuleConfiguration : IEntityTypeConfiguration<RunningOrderRule>
{
    private const int EnumLength = 32;

    private static readonly string KnownKinds = string.Join(
        ", ",
        Enum.GetNames<RunningOrderRuleKind>().Select(name => $"'{name}'")
    );

    private static readonly string KnownStrengths = string.Join(
        ", ",
        Enum.GetNames<RuleStrength>().Select(name => $"'{name}'")
    );

    private static readonly string KnownActKinds = string.Join(
        ", ",
        Enum.GetNames<ActKind>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<RunningOrderRule> builder)
    {
        builder.ToTable(
            "running_order_rule",
            table =>
            {
                table.HasCheckConstraint("ck_running_order_rule_kind", $"kind IN ({KnownKinds})");
                table.HasCheckConstraint(
                    "ck_running_order_rule_strength",
                    $"strength IN ({KnownStrengths})"
                );
                table.HasCheckConstraint(
                    "ck_running_order_rule_act_kind",
                    $"act_kind IS NULL OR act_kind IN ({KnownActKinds})"
                );
            }
        );
        builder.HasKey(rule => rule.Id);

        builder.Property(rule => rule.Kind).HasConversion<string>().HasMaxLength(EnumLength);
        builder.Property(rule => rule.Strength).HasConversion<string>().HasMaxLength(EnumLength);
        builder.Property(rule => rule.ActKind).HasConversion<string>().HasMaxLength(EnumLength);

        builder
            .HasOne(rule => rule.RunningOrder)
            .WithMany(order => order.Rules)
            .HasForeignKey(rule => rule.CalendarEntryId)
            .HasConstraintName("fk_running_order_rule_running_order_calendar_entry_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(rule => rule.Act)
            .WithMany()
            .HasForeignKey(rule => rule.ActId)
            .HasConstraintName("fk_running_order_rule_act_act_id")
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(rule => rule.ActId).HasDatabaseName("ix_running_order_rule_act_id");

        builder
            .HasOne(rule => rule.OtherAct)
            .WithMany()
            .HasForeignKey(rule => rule.OtherActId)
            .HasConstraintName("fk_running_order_rule_act_other_act_id")
            .OnDelete(DeleteBehavior.Restrict);
        builder
            .HasIndex(rule => rule.OtherActId)
            .HasDatabaseName("ix_running_order_rule_other_act_id");
        builder
            .HasIndex(rule => rule.CalendarEntryId)
            .HasDatabaseName("ix_running_order_rule_calendar_entry_id");
    }
}
