using Furria.Core.Club;
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
            {
                table.HasCheckConstraint("ck_act_kind", $"kind IS NULL OR kind IN ({KnownKinds})");
                table.HasCheckConstraint(
                    "ck_act_session_year",
                    $"session_year IS NULL OR session_year >= {ClubSession.EarliestSessionYear}"
                );
                table.HasCheckConstraint(
                    "ck_act_frozen_cast_dated",
                    "cast_frozen_at IS NULL OR session_year IS NOT NULL"
                );
                table.HasCheckConstraint(
                    "ck_act_follows_other_act",
                    "follows_act_id IS NULL OR follows_act_id <> id"
                );
                table.HasCheckConstraint(
                    "ck_act_timeless_kind",
                    $"session_year IS NULL OR (kind IS NOT NULL AND kind <> '{ActKind.Point}')"
                );
            }
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

        builder
            .HasOne(act => act.FollowsAct)
            .WithMany()
            .HasForeignKey(act => act.FollowsActId)
            .HasConstraintName("fk_act_act_follows_act_id")
            .OnDelete(DeleteBehavior.SetNull);
        builder.HasIndex(act => act.FollowsActId).HasDatabaseName("ix_act_follows_act_id");
        builder.HasIndex(act => act.SessionYear).HasDatabaseName("ix_act_session_year");

        builder.Property(act => act.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(act => act.UpdatedAt).HasDefaultValueSql("now()");
    }
}
