using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class VereinVerwalten : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "signet_svg",
                table: "session",
                newName: "logo_svg"
            );

            migrationBuilder.AddColumn<DateOnly>(
                name: "archived_on",
                table: "venue",
                type: "date",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "city",
                table: "venue",
                type: "character varying(80)",
                maxLength: 80,
                nullable: false,
                defaultValue: "",
                collation: "de-DE-x-icu"
            );

            migrationBuilder.AddColumn<string>(
                name: "hint",
                table: "venue",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "street",
                table: "venue",
                type: "character varying(120)",
                maxLength: 120,
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.AddColumn<string>(
                name: "zip",
                table: "venue",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.AddColumn<DateOnly>(
                name: "archived_on",
                table: "board_office",
                type: "date",
                nullable: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "archived_on", table: "venue");

            migrationBuilder.DropColumn(name: "city", table: "venue");

            migrationBuilder.DropColumn(name: "hint", table: "venue");

            migrationBuilder.DropColumn(name: "street", table: "venue");

            migrationBuilder.DropColumn(name: "zip", table: "venue");

            migrationBuilder.DropColumn(name: "archived_on", table: "board_office");

            migrationBuilder.RenameColumn(
                name: "logo_svg",
                table: "session",
                newName: "signet_svg"
            );
        }
    }
}
