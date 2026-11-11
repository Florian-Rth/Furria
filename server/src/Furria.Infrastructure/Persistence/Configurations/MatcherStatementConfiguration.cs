using Furria.Core.GroupMatcher;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Furria.Infrastructure.Persistence.Configurations;

public sealed class MatcherStatementConfiguration : IEntityTypeConfiguration<MatcherStatement>
{
    public void Configure(EntityTypeBuilder<MatcherStatement> builder)
    {
        builder.ToTable(
            "group_matcher_statement",
            table =>
                table.HasCheckConstraint(
                    "ck_group_matcher_statement_sort_order",
                    $"sort_order BETWEEN 1 AND {MatcherStatement.MaxInPool}"
                )
        );
        builder.HasKey(statement => statement.Id);

        builder
            .Property(statement => statement.Text)
            .HasMaxLength(MatcherStatement.MaxTextLength)
            .IsRequired();

        builder.Property(statement => statement.CreatedAt).HasDefaultValueSql("now()");
        builder.Property(statement => statement.UpdatedAt).HasDefaultValueSql("now()");
    }
}
