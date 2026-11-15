using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CalendarAnnouncedPush : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_calendar_push_reason",
                table: "outbox_calendar_push"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_calendar_push_recipients",
                table: "outbox_calendar_push"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_calendar_push_reason",
                table: "outbox_calendar_push",
                sql: "reason IN ('AsksForResponse', 'Chosen', 'Moved', 'Deleted', 'Reminder', 'Announced')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_calendar_push_recipients",
                table: "outbox_calendar_push",
                sql: "reason IN ('AsksForResponse', 'Reminder', 'Announced') OR cardinality(person_ids) > 0"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_calendar_push_reason",
                table: "outbox_calendar_push"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_calendar_push_recipients",
                table: "outbox_calendar_push"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_calendar_push_reason",
                table: "outbox_calendar_push",
                sql: "reason IN ('AsksForResponse', 'Chosen', 'Moved', 'Deleted', 'Reminder')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_calendar_push_recipients",
                table: "outbox_calendar_push",
                sql: "reason IN ('AsksForResponse', 'Reminder') OR cardinality(person_ids) > 0"
            );
        }
    }
}
