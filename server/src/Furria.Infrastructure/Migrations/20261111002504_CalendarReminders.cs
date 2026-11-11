using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CalendarReminders : Migration
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

            migrationBuilder.AddColumn<int>(
                name: "reminder_add_on_id",
                table: "outbox_calendar_push",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "reminder_closes_at",
                table: "outbox_calendar_push",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "reminder_kind",
                table: "outbox_calendar_push",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "reminder_subject",
                table: "outbox_calendar_push",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true
            );

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "last_reminded_at",
                table: "calendar_sign_up_list",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "last_reminded_at",
                table: "calendar_poll",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "attendance_last_reminded_at",
                table: "calendar_entry",
                type: "timestamp with time zone",
                nullable: true
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

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_calendar_push_reminder",
                table: "outbox_calendar_push",
                sql: "(reason = 'Reminder') = (reminder_kind IS NOT NULL AND reminder_closes_at IS NOT NULL)"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_calendar_push_reminder_kind",
                table: "outbox_calendar_push",
                sql: "reminder_kind IS NULL OR reminder_kind IN ('Attendance', 'Poll', 'SignUpList')"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM outbox_calendar_push WHERE reason = 'Reminder';");

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_calendar_push_reason",
                table: "outbox_calendar_push"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_calendar_push_recipients",
                table: "outbox_calendar_push"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_calendar_push_reminder",
                table: "outbox_calendar_push"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_calendar_push_reminder_kind",
                table: "outbox_calendar_push"
            );

            migrationBuilder.DropColumn(name: "reminder_add_on_id", table: "outbox_calendar_push");

            migrationBuilder.DropColumn(name: "reminder_closes_at", table: "outbox_calendar_push");

            migrationBuilder.DropColumn(name: "reminder_kind", table: "outbox_calendar_push");

            migrationBuilder.DropColumn(name: "reminder_subject", table: "outbox_calendar_push");

            migrationBuilder.DropColumn(name: "last_reminded_at", table: "calendar_sign_up_list");

            migrationBuilder.DropColumn(name: "last_reminded_at", table: "calendar_poll");

            migrationBuilder.DropColumn(
                name: "attendance_last_reminded_at",
                table: "calendar_entry"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_calendar_push_reason",
                table: "outbox_calendar_push",
                sql: "reason IN ('AsksForResponse', 'Chosen', 'Moved', 'Deleted')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_calendar_push_recipients",
                table: "outbox_calendar_push",
                sql: "reason = 'AsksForResponse' OR cardinality(person_ids) > 0"
            );
        }
    }
}
