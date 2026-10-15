using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RoleCoins : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "tone",
                table: "role",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true
            );

            migrationBuilder.Sql("UPDATE role SET icon = NULL;");

            migrationBuilder.AddCheckConstraint(
                name: "ck_role_coin",
                table: "role",
                sql: "(icon IS NULL) = (tone IS NULL)"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_role_tone",
                table: "role",
                sql: "tone IS NULL OR tone IN ('Clay', 'Olive', 'Lime', 'Fern', 'Teal', 'Indigo', 'Iris', 'Violet', 'Orchid', 'Rose')"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(name: "ck_role_coin", table: "role");

            migrationBuilder.DropCheckConstraint(name: "ck_role_tone", table: "role");

            migrationBuilder.DropColumn(name: "tone", table: "role");
        }
    }
}
