using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CalendarReminderNamesItsFunction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "DELETE FROM outbox_calendar_push WHERE reason = 'Reminder' AND reminder_add_on_id IS NULL;"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_calendar_push_reminder",
                table: "outbox_calendar_push"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_calendar_push_reminder",
                table: "outbox_calendar_push",
                sql: "(reason = 'Reminder') = (reminder_kind IS NOT NULL AND reminder_add_on_id IS NOT NULL AND reminder_closes_at IS NOT NULL)"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_calendar_push_reminder",
                table: "outbox_calendar_push"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_calendar_push_reminder",
                table: "outbox_calendar_push",
                sql: "(reason = 'Reminder') = (reminder_kind IS NOT NULL AND reminder_closes_at IS NOT NULL)"
            );
        }
    }
}
