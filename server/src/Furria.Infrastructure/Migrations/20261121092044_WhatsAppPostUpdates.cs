using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class WhatsAppPostUpdates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_whatsapp_add_on_operation",
                table: "outbox_whatsapp"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_whatsapp_operation",
                table: "outbox_whatsapp"
            );

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "result_told_at",
                table: "whatsapp_message",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "text",
                table: "whatsapp_message",
                type: "text",
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.AddColumn<string>(
                name: "target_message_id",
                table: "outbox_whatsapp",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_whatsapp_message_result_untold",
                table: "whatsapp_message",
                column: "add_on_kind",
                filter: "result_told_at IS NULL AND add_on_kind IN ('Poll', 'Attendance')"
            );

            migrationBuilder.Sql(
                """
                DELETE FROM whatsapp_message AS later
                USING whatsapp_message AS earlier
                WHERE later.add_on_kind IS NOT NULL
                  AND later.host_kind = earlier.host_kind
                  AND later.host_id = earlier.host_id
                  AND later.add_on_kind = earlier.add_on_kind
                  AND later.add_on_id IS NOT DISTINCT FROM earlier.add_on_id
                  AND later.id > earlier.id
                """
            );

            migrationBuilder
                .CreateIndex(
                    name: "ux_whatsapp_message_add_on",
                    table: "whatsapp_message",
                    columns: new[] { "host_kind", "host_id", "add_on_kind", "add_on_id" },
                    unique: true,
                    filter: "add_on_kind IS NOT NULL"
                )
                .Annotation("Npgsql:NullsDistinct", false);

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_add_on_operation",
                table: "outbox_whatsapp",
                sql: "operation IN ('PostText', 'EditText', 'Reply', 'Delete') OR add_on_kind IS NOT NULL"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_operation",
                table: "outbox_whatsapp",
                sql: "operation IN ('PostText', 'SendPoll', 'SendEvent', 'EditText', 'Reply', 'Delete')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_target_message",
                table: "outbox_whatsapp",
                sql: "(operation IN ('EditText', 'Reply', 'Delete')) = (target_message_id IS NOT NULL)"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "DELETE FROM outbox_whatsapp WHERE operation IN ('EditText', 'Reply', 'Delete')"
            );

            migrationBuilder.DropIndex(
                name: "ix_whatsapp_message_result_untold",
                table: "whatsapp_message"
            );

            migrationBuilder.DropIndex(
                name: "ux_whatsapp_message_add_on",
                table: "whatsapp_message"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_whatsapp_add_on_operation",
                table: "outbox_whatsapp"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_whatsapp_operation",
                table: "outbox_whatsapp"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_whatsapp_target_message",
                table: "outbox_whatsapp"
            );

            migrationBuilder.DropColumn(name: "result_told_at", table: "whatsapp_message");

            migrationBuilder.DropColumn(name: "text", table: "whatsapp_message");

            migrationBuilder.DropColumn(name: "target_message_id", table: "outbox_whatsapp");

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_add_on_operation",
                table: "outbox_whatsapp",
                sql: "operation = 'PostText' OR add_on_kind IS NOT NULL"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_operation",
                table: "outbox_whatsapp",
                sql: "operation IN ('PostText', 'SendPoll', 'SendEvent')"
            );
        }
    }
}
