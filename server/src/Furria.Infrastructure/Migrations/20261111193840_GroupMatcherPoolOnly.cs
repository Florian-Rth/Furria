using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class GroupMatcherPoolOnly : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DELETE FROM group_matcher_statement WHERE status <> 'Approved';
                UPDATE group_matcher_statement SET created_at = approved_at;
                """
            );

            migrationBuilder.DropForeignKey(
                name: "fk_group_matcher_statement_group_proposed_by_group_id",
                table: "group_matcher_statement"
            );

            migrationBuilder.DropIndex(
                name: "ix_group_matcher_statement_proposed_by_group_id",
                table: "group_matcher_statement"
            );

            migrationBuilder.DropIndex(
                name: "ix_group_matcher_statement_status_sort_order",
                table: "group_matcher_statement"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_group_matcher_statement_approval",
                table: "group_matcher_statement"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_group_matcher_statement_status",
                table: "group_matcher_statement"
            );

            migrationBuilder.DropColumn(name: "approved_at", table: "group_matcher_statement");

            migrationBuilder.DropColumn(
                name: "proposed_by_group_id",
                table: "group_matcher_statement"
            );

            migrationBuilder.DropColumn(name: "status", table: "group_matcher_statement");

            migrationBuilder.AlterColumn<int>(
                name: "sort_order",
                table: "group_matcher_statement",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "sort_order",
                table: "group_matcher_statement",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer"
            );

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "approved_at",
                table: "group_matcher_statement",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "proposed_by_group_id",
                table: "group_matcher_statement",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "group_matcher_statement",
                type: "character varying(16)",
                maxLength: 16,
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.Sql(
                "UPDATE group_matcher_statement SET status = 'Approved', approved_at = created_at;"
            );

            migrationBuilder.CreateIndex(
                name: "ix_group_matcher_statement_proposed_by_group_id",
                table: "group_matcher_statement",
                column: "proposed_by_group_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_group_matcher_statement_status_sort_order",
                table: "group_matcher_statement",
                columns: new[] { "status", "sort_order" }
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_group_matcher_statement_approval",
                table: "group_matcher_statement",
                sql: "(status = 'Approved') = (sort_order IS NOT NULL AND approved_at IS NOT NULL)"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_group_matcher_statement_status",
                table: "group_matcher_statement",
                sql: "status IN ('Proposed', 'Approved', 'Rejected')"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_group_matcher_statement_group_proposed_by_group_id",
                table: "group_matcher_statement",
                column: "proposed_by_group_id",
                principalTable: "group",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull
            );
        }
    }
}
