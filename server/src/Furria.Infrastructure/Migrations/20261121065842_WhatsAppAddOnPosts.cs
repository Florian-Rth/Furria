using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class WhatsAppAddOnPosts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_whatsapp_operation",
                table: "outbox_whatsapp"
            );

            migrationBuilder.AddColumn<int>(
                name: "add_on_id",
                table: "whatsapp_message",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "add_on_kind",
                table: "whatsapp_message",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true
            );

            migrationBuilder.AddColumn<List<int>>(
                name: "poll_option_ids",
                table: "whatsapp_message",
                type: "integer[]",
                nullable: false,
                defaultValueSql: "'{}'"
            );

            migrationBuilder.AddColumn<List<string>>(
                name: "poll_options",
                table: "whatsapp_message",
                type: "text[]",
                nullable: false,
                defaultValueSql: "'{}'"
            );

            migrationBuilder.AddColumn<int>(
                name: "add_on_id",
                table: "outbox_whatsapp",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "add_on_kind",
                table: "outbox_whatsapp",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true
            );

            migrationBuilder.AddColumn<bool>(
                name: "allows_several_answers",
                table: "outbox_whatsapp",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "event_ends_at",
                table: "outbox_whatsapp",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "event_place",
                table: "outbox_whatsapp",
                type: "character varying(80)",
                maxLength: 80,
                nullable: true
            );

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "event_starts_at",
                table: "outbox_whatsapp",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.AddColumn<List<int>>(
                name: "poll_option_ids",
                table: "outbox_whatsapp",
                type: "integer[]",
                nullable: false,
                defaultValueSql: "'{}'"
            );

            migrationBuilder.AddColumn<List<string>>(
                name: "poll_options",
                table: "outbox_whatsapp",
                type: "text[]",
                nullable: false,
                defaultValueSql: "'{}'"
            );

            migrationBuilder.CreateIndex(
                name: "ix_whatsapp_message_add_on_kind_add_on_id",
                table: "whatsapp_message",
                columns: new[] { "add_on_kind", "add_on_id" },
                filter: "add_on_id IS NOT NULL"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_whatsapp_message_add_on_id",
                table: "whatsapp_message",
                sql: "(add_on_id IS NULL AND (add_on_kind IS NULL OR add_on_kind = 'Attendance')) OR (add_on_id IS NOT NULL AND add_on_kind IN ('Poll', 'SignUpList'))"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_whatsapp_message_add_on_kind",
                table: "whatsapp_message",
                sql: "add_on_kind IN ('Attendance', 'Poll', 'SignUpList')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_whatsapp_message_poll_option_ids",
                table: "whatsapp_message",
                sql: "cardinality(poll_option_ids) = 0 OR cardinality(poll_option_ids) = cardinality(poll_options)"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_whatsapp_message_poll_options",
                table: "whatsapp_message",
                sql: "cardinality(poll_options) = 0 OR add_on_kind IS NOT NULL"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_add_on_id",
                table: "outbox_whatsapp",
                sql: "(add_on_id IS NULL AND (add_on_kind IS NULL OR add_on_kind = 'Attendance')) OR (add_on_id IS NOT NULL AND add_on_kind IN ('Poll', 'SignUpList'))"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_add_on_kind",
                table: "outbox_whatsapp",
                sql: "add_on_kind IN ('Attendance', 'Poll', 'SignUpList')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_add_on_operation",
                table: "outbox_whatsapp",
                sql: "operation = 'PostText' OR add_on_kind IS NOT NULL"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_event",
                table: "outbox_whatsapp",
                sql: "CASE WHEN operation = 'SendEvent' THEN event_starts_at IS NOT NULL AND (event_ends_at IS NULL OR event_ends_at >= event_starts_at) ELSE event_starts_at IS NULL AND event_ends_at IS NULL AND event_place IS NULL END"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_operation",
                table: "outbox_whatsapp",
                sql: "operation IN ('PostText', 'SendPoll', 'SendEvent')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_poll",
                table: "outbox_whatsapp",
                sql: "(operation = 'SendPoll') = (cardinality(poll_options) BETWEEN 2 AND 12)"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_poll_option_ids",
                table: "outbox_whatsapp",
                sql: "cardinality(poll_option_ids) = 0 OR cardinality(poll_option_ids) = cardinality(poll_options)"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_poll_options",
                table: "outbox_whatsapp",
                sql: "cardinality(poll_options) = 0 OR add_on_kind IS NOT NULL"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_whatsapp_message_add_on_kind_add_on_id",
                table: "whatsapp_message"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_whatsapp_message_add_on_id",
                table: "whatsapp_message"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_whatsapp_message_add_on_kind",
                table: "whatsapp_message"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_whatsapp_message_poll_option_ids",
                table: "whatsapp_message"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_whatsapp_message_poll_options",
                table: "whatsapp_message"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_whatsapp_add_on_id",
                table: "outbox_whatsapp"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_whatsapp_add_on_kind",
                table: "outbox_whatsapp"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_whatsapp_add_on_operation",
                table: "outbox_whatsapp"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_whatsapp_event",
                table: "outbox_whatsapp"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_whatsapp_operation",
                table: "outbox_whatsapp"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_whatsapp_poll",
                table: "outbox_whatsapp"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_whatsapp_poll_option_ids",
                table: "outbox_whatsapp"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_whatsapp_poll_options",
                table: "outbox_whatsapp"
            );

            migrationBuilder.DropColumn(name: "add_on_id", table: "whatsapp_message");

            migrationBuilder.DropColumn(name: "add_on_kind", table: "whatsapp_message");

            migrationBuilder.DropColumn(name: "poll_option_ids", table: "whatsapp_message");

            migrationBuilder.DropColumn(name: "poll_options", table: "whatsapp_message");

            migrationBuilder.DropColumn(name: "add_on_id", table: "outbox_whatsapp");

            migrationBuilder.DropColumn(name: "add_on_kind", table: "outbox_whatsapp");

            migrationBuilder.DropColumn(name: "allows_several_answers", table: "outbox_whatsapp");

            migrationBuilder.DropColumn(name: "event_ends_at", table: "outbox_whatsapp");

            migrationBuilder.DropColumn(name: "event_place", table: "outbox_whatsapp");

            migrationBuilder.DropColumn(name: "event_starts_at", table: "outbox_whatsapp");

            migrationBuilder.DropColumn(name: "poll_option_ids", table: "outbox_whatsapp");

            migrationBuilder.DropColumn(name: "poll_options", table: "outbox_whatsapp");

            migrationBuilder.Sql("DELETE FROM outbox_whatsapp WHERE operation <> 'PostText';");

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_operation",
                table: "outbox_whatsapp",
                sql: "operation IN ('PostText')"
            );
        }
    }
}
