using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PersonArchive : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "archived_by_person_id",
                table: "person",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<DateOnly>(
                name: "archived_on",
                table: "person",
                type: "date",
                nullable: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_person_archived_by_person_id",
                table: "person",
                column: "archived_by_person_id"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_person_person_archived_by_person_id",
                table: "person",
                column: "archived_by_person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_person_person_archived_by_person_id",
                table: "person"
            );

            migrationBuilder.DropIndex(name: "ix_person_archived_by_person_id", table: "person");

            migrationBuilder.DropColumn(name: "archived_by_person_id", table: "person");

            migrationBuilder.DropColumn(name: "archived_on", table: "person");
        }
    }
}
