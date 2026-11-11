using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CalendarEntryAddOnPositions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "attendance_position",
                table: "calendar_entry",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "participating_groups_position",
                table: "calendar_entry",
                type: "integer",
                nullable: true
            );

            migrationBuilder.Sql(
                """
                UPDATE calendar_entry
                SET attendance_position = 0
                WHERE asks_for_response;
                """
            );

            migrationBuilder.Sql(
                """
                UPDATE calendar_entry entry
                SET participating_groups_position =
                    CASE WHEN entry.asks_for_response THEN 1 ELSE 0 END
                WHERE entry.kind <> 'Event'
                    AND EXISTS (
                        SELECT 1 FROM calendar_entry_group link
                        WHERE link.calendar_entry_id = entry.id
                    );
                """
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_calendar_entry_add_on_positions",
                table: "calendar_entry",
                sql: "(attendance_position IS NULL OR attendance_position >= 0) AND (participating_groups_position IS NULL OR participating_groups_position >= 0)"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_calendar_entry_attendance_add_on",
                table: "calendar_entry",
                sql: "asks_for_response = (attendance_position IS NOT NULL)"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_calendar_entry_add_on_positions",
                table: "calendar_entry"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_calendar_entry_attendance_add_on",
                table: "calendar_entry"
            );

            migrationBuilder.DropColumn(name: "attendance_position", table: "calendar_entry");

            migrationBuilder.DropColumn(
                name: "participating_groups_position",
                table: "calendar_entry"
            );
        }
    }
}
