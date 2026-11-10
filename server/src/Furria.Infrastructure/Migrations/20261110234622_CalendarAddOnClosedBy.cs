using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CalendarAddOnClosedBy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "closed_by_person_id",
                table: "calendar_sign_up_list",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "closed_by_person_id",
                table: "calendar_poll",
                type: "integer",
                nullable: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_calendar_sign_up_list_closed_by_person_id",
                table: "calendar_sign_up_list",
                column: "closed_by_person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_calendar_poll_closed_by_person_id",
                table: "calendar_poll",
                column: "closed_by_person_id"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_calendar_poll_person_closed_by_person_id",
                table: "calendar_poll",
                column: "closed_by_person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull
            );

            migrationBuilder.AddForeignKey(
                name: "fk_calendar_sign_up_list_person_closed_by_person_id",
                table: "calendar_sign_up_list",
                column: "closed_by_person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_calendar_poll_person_closed_by_person_id",
                table: "calendar_poll"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_calendar_sign_up_list_person_closed_by_person_id",
                table: "calendar_sign_up_list"
            );

            migrationBuilder.DropIndex(
                name: "ix_calendar_sign_up_list_closed_by_person_id",
                table: "calendar_sign_up_list"
            );

            migrationBuilder.DropIndex(
                name: "ix_calendar_poll_closed_by_person_id",
                table: "calendar_poll"
            );

            migrationBuilder.DropColumn(
                name: "closed_by_person_id",
                table: "calendar_sign_up_list"
            );

            migrationBuilder.DropColumn(name: "closed_by_person_id", table: "calendar_poll");
        }
    }
}
