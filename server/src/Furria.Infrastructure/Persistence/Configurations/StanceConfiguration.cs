using Furria.Core.GroupMatcher;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class StanceConfiguration : IEntityTypeConfiguration<Stance>
{
    private const int EnumLength = 16;

    private static readonly string KnownValues = string.Join(
        ", ",
        Enum.GetNames<StancePosition>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<Stance> builder)
    {
        builder.ToTable(
            "group_matcher_stance",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_group_matcher_stance_importance",
                    $"importance BETWEEN {Stance.MinImportance} AND {Stance.MaxImportance}"
                );
                table.HasCheckConstraint(
                    "ck_group_matcher_stance_position",
                    $"position IN ({KnownValues})"
                );
            }
        );
        builder.HasKey(stance => new { stance.GroupId, stance.StatementId });

        builder
            .Property(stance => stance.Position)
            .HasConversion<string>()
            .HasMaxLength(EnumLength);

        builder
            .HasOne(stance => stance.Group)
            .WithMany()
            .HasForeignKey(stance => stance.GroupId)
            .HasConstraintName("fk_group_matcher_stance_group_group_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder
            .HasOne(stance => stance.Statement)
            .WithMany(statement => statement.Stances)
            .HasForeignKey(stance => stance.StatementId)
            .HasConstraintName("fk_group_matcher_stance_group_matcher_statement_statement_id")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(stance => stance.StatementId);
    }
}
