using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class GroupMatcherPoolOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddCheckConstraint(
                name: "ck_group_matcher_statement_sort_order",
                table: "group_matcher_statement",
                sql: "sort_order BETWEEN 1 AND 10"
            );

            migrationBuilder.Sql(
                """
                ALTER TABLE group_matcher_statement
                ADD CONSTRAINT uq_group_matcher_statement_sort_order
                UNIQUE (sort_order) DEFERRABLE INITIALLY IMMEDIATE;
                """
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "ALTER TABLE group_matcher_statement DROP CONSTRAINT uq_group_matcher_statement_sort_order;"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_group_matcher_statement_sort_order",
                table: "group_matcher_statement"
            );
        }
    }
}
