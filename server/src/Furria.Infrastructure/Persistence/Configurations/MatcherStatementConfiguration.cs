using Furria.Core.GroupMatcher;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class MatcherStatementConfiguration : IEntityTypeConfiguration<MatcherStatement>
{
    private const int EnumLength = 16;

    private static readonly string KnownValues = string.Join(
        ", ",
        Enum.GetNames<MatcherStatementStatus>().Select(name => $"'{name}'")
    );

    public void Configure(EntityTypeBuilder<MatcherStatement> builder)
    {
        builder.ToTable(
            "group_matcher_statement",
            table =>
            {
                table.HasCheckConstraint(
                    "ck_group_matcher_statement_approval",
                    "(status = 'Approved') = (sort_order IS NOT NULL AND approved_at IS NOT NULL)"
                );
                table.HasCheckConstraint(
                    "ck_group_matcher_statement_status",
                    $"status IN ({KnownValues})"
                );
            }
        );
        builder.HasKey(statement => statement.Id);

        builder
            .Property(statement => statement.Text)
            .HasMaxLength(MatcherStatement.MaxTextLength)
            .IsRequired();
        builder
            .Property(statement => statement.Status)
            .HasConversion<string>()
            .HasMaxLength(EnumLength);

        builder
            .HasOne(statement => statement.ProposedByGroup)
            .WithMany()
            .HasForeignKey(statement => statement.ProposedByGroupId)
            .HasConstraintName("fk_group_matcher_statement_group_proposed_by_group_id")
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(statement => new { statement.Status, statement.SortOrder });
        builder.HasIndex(statement => statement.ProposedByGroupId);

        builder.Property(statement => statement.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(statement => statement.UpdatedAt).HasDefaultValueSql("now()");
    }
}
