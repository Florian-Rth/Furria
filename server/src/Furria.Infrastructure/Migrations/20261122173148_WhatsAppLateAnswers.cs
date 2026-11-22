using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class WhatsAppLateAnswers : Migration
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

            migrationBuilder.CreateTable(
                name: "whatsapp_late_answer",
                columns: table => new
                {
                    id = table
                        .Column<long>(type: "bigint", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    whatsapp_message_id = table.Column<long>(type: "bigint", nullable: false),
                    sender_id = table.Column<string>(
                        type: "character varying(128)",
                        maxLength: 128,
                        nullable: false
                    ),
                    told_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_whatsapp_late_answer", x => x.id);
                    table.ForeignKey(
                        name: "fk_whatsapp_late_answer_whatsapp_message_whatsapp_message_id",
                        column: x => x.whatsapp_message_id,
                        principalTable: "whatsapp_message",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_add_on_operation",
                table: "outbox_whatsapp",
                sql: "operation IN ('PostText', 'EditText', 'Reply', 'Delete', 'AddParticipant', 'DirectText') OR add_on_kind IS NOT NULL"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_operation",
                table: "outbox_whatsapp",
                sql: "operation IN ('PostText', 'SendPoll', 'SendEvent', 'EditText', 'Reply', 'Delete', 'AddParticipant', 'DirectText')"
            );

            migrationBuilder.CreateIndex(
                name: "ix_whatsapp_late_answer_whatsapp_message_id_sender_id",
                table: "whatsapp_late_answer",
                columns: new[] { "whatsapp_message_id", "sender_id" },
                unique: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "whatsapp_late_answer");

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_whatsapp_add_on_operation",
                table: "outbox_whatsapp"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_whatsapp_operation",
                table: "outbox_whatsapp"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_add_on_operation",
                table: "outbox_whatsapp",
                sql: "operation IN ('PostText', 'EditText', 'Reply', 'Delete', 'AddParticipant') OR add_on_kind IS NOT NULL"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_operation",
                table: "outbox_whatsapp",
                sql: "operation IN ('PostText', 'SendPoll', 'SendEvent', 'EditText', 'Reply', 'Delete', 'AddParticipant')"
            );
        }
    }
}
