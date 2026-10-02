using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PublicBoardOffices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "portrait_is_public", table: "person");

            migrationBuilder.AddColumn<bool>(
                name: "is_public",
                table: "board_office",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "is_public", table: "board_office");

            migrationBuilder.AddColumn<bool>(
                name: "portrait_is_public",
                table: "person",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );
        }
    }
}
