using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class WhatsAppOutbox : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "outbox_whatsapp",
                columns: table => new
                {
                    id = table
                        .Column<long>(type: "bigint", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    chat_id = table.Column<string>(
                        type: "character varying(128)",
                        maxLength: 128,
                        nullable: false
                    ),
                    operation = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    host_kind = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    host_id = table.Column<int>(type: "integer", nullable: false),
                    text = table.Column<string>(type: "text", nullable: false),
                    mentions = table.Column<List<string>>(type: "text[]", nullable: false),
                    enqueued_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    attempt = table.Column<int>(type: "integer", nullable: false),
                    next_attempt_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    failed_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    last_error = table.Column<string>(
                        type: "character varying(500)",
                        maxLength: 500,
                        nullable: true
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_outbox_whatsapp", x => x.id);
                    table.CheckConstraint("ck_outbox_whatsapp_attempt", "attempt >= 1");
                    table.CheckConstraint(
                        "ck_outbox_whatsapp_host_kind",
                        "host_kind IN ('Announcement', 'CalendarEntry')"
                    );
                    table.CheckConstraint(
                        "ck_outbox_whatsapp_operation",
                        "operation IN ('PostText')"
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "whatsapp_message",
                columns: table => new
                {
                    id = table
                        .Column<long>(type: "bigint", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    chat_id = table.Column<string>(
                        type: "character varying(128)",
                        maxLength: 128,
                        nullable: false
                    ),
                    message_id = table.Column<string>(
                        type: "character varying(256)",
                        maxLength: 256,
                        nullable: false
                    ),
                    host_kind = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    host_id = table.Column<int>(type: "integer", nullable: false),
                    sent_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_whatsapp_message", x => x.id);
                    table.CheckConstraint(
                        "ck_whatsapp_message_host_kind",
                        "host_kind IN ('Announcement', 'CalendarEntry')"
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_outbox_whatsapp_failed",
                table: "outbox_whatsapp",
                column: "failed_at",
                filter: "failed_at IS NOT NULL"
            );

            migrationBuilder.CreateIndex(
                name: "ix_outbox_whatsapp_host_kind_host_id",
                table: "outbox_whatsapp",
                columns: new[] { "host_kind", "host_id" }
            );

            migrationBuilder.CreateIndex(
                name: "ix_outbox_whatsapp_waiting",
                table: "outbox_whatsapp",
                columns: new[] { "chat_id", "id" },
                filter: "failed_at IS NULL"
            );

            migrationBuilder.CreateIndex(
                name: "ix_whatsapp_message_chat_id_message_id",
                table: "whatsapp_message",
                columns: new[] { "chat_id", "message_id" },
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_whatsapp_message_host_kind_host_id",
                table: "whatsapp_message",
                columns: new[] { "host_kind", "host_id" }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "outbox_whatsapp");

            migrationBuilder.DropTable(name: "whatsapp_message");
        }
    }
}
