using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ContactChange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "contact_changed_at",
                table: "person",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "contact_changed_by_person_id",
                table: "person",
                type: "integer",
                nullable: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_person_contact_changed_by_person_id",
                table: "person",
                column: "contact_changed_by_person_id"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_person_person_contact_changed_by_person_id",
                table: "person",
                column: "contact_changed_by_person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_person_person_contact_changed_by_person_id",
                table: "person"
            );

            migrationBuilder.DropIndex(
                name: "ix_person_contact_changed_by_person_id",
                table: "person"
            );

            migrationBuilder.DropColumn(name: "contact_changed_at", table: "person");

            migrationBuilder.DropColumn(name: "contact_changed_by_person_id", table: "person");
        }
    }
}
