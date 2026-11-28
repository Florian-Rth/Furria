using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class BordersAreCheckedOneByOne : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "needs_check",
                table: "act_step",
                newName: "start_needs_check"
            );

            migrationBuilder.AddColumn<bool>(
                name: "end_needs_check",
                table: "act_step",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );

            migrationBuilder.Sql(
                """
                UPDATE act_step SET end_needs_check = start_needs_check;
                ALTER TABLE act_step ALTER COLUMN end_needs_check DROP DEFAULT;
                """
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "UPDATE act_step SET start_needs_check = start_needs_check OR end_needs_check;"
            );

            migrationBuilder.DropColumn(name: "end_needs_check", table: "act_step");

            migrationBuilder.RenameColumn(
                name: "start_needs_check",
                table: "act_step",
                newName: "needs_check"
            );
        }
    }
}
