using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class TablePlanCounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "chairs",
                table: "table_plan",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.AddColumn<int>(
                name: "tables",
                table: "table_plan",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.Sql(
                """
                UPDATE table_plan
                SET tables = COALESCE(
                    (SELECT SUM((table_row ->> 'count')::integer)
                     FROM jsonb_array_elements(document -> 'rows') AS table_row),
                    0);
                """
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "chairs", table: "table_plan");

            migrationBuilder.DropColumn(name: "tables", table: "table_plan");
        }
    }
}
