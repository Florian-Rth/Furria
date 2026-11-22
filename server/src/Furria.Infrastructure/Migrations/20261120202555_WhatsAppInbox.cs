using System;
using Furria.Infrastructure.Changes;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class WhatsAppInbox : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "inbox_whatsapp",
                columns: table => new
                {
                    id = table
                        .Column<long>(type: "bigint", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    request_id = table.Column<string>(
                        type: "character varying(128)",
                        maxLength: 128,
                        nullable: false
                    ),
                    @event = table.Column<string>(
                        name: "event",
                        type: "character varying(64)",
                        maxLength: 64,
                        nullable: false
                    ),
                    session = table.Column<string>(
                        type: "character varying(64)",
                        maxLength: 64,
                        nullable: false
                    ),
                    occurred_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    received_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    body = table.Column<string>(type: "jsonb", nullable: false),
                    attempt = table.Column<int>(type: "integer", nullable: false),
                    next_attempt_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    processed_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_inbox_whatsapp", x => x.id);
                    table.CheckConstraint("ck_inbox_whatsapp_attempt", "attempt >= 1");
                }
            );

            migrationBuilder.CreateTable(
                name: "linked_whatsapp_group",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    chat_id = table.Column<string>(
                        type: "character varying(128)",
                        maxLength: 128,
                        nullable: false
                    ),
                    group_id = table.Column<int>(type: "integer", nullable: true),
                    linked_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_linked_whatsapp_group", x => x.id);
                    table.ForeignKey(
                        name: "fk_linked_whatsapp_group_group_group_id",
                        column: x => x.group_id,
                        principalTable: "group",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "whatsapp_session",
                columns: table => new
                {
                    name = table.Column<string>(
                        type: "character varying(64)",
                        maxLength: 64,
                        nullable: false
                    ),
                    status = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    status_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    was_working = table.Column<bool>(type: "boolean", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_whatsapp_session", x => x.name);
                    table.CheckConstraint(
                        "ck_whatsapp_session_status",
                        "status IN ('Stopped', 'Starting', 'ScanQrCode', 'Working', 'Failed')"
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_inbox_whatsapp_processed_at",
                table: "inbox_whatsapp",
                column: "processed_at",
                filter: "processed_at IS NOT NULL"
            );

            migrationBuilder.CreateIndex(
                name: "ix_inbox_whatsapp_request_id",
                table: "inbox_whatsapp",
                column: "request_id",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_inbox_whatsapp_unprocessed",
                table: "inbox_whatsapp",
                column: "id",
                filter: "processed_at IS NULL"
            );

            migrationBuilder
                .CreateIndex(
                    name: "ix_linked_whatsapp_group_audience",
                    table: "linked_whatsapp_group",
                    column: "group_id",
                    unique: true
                )
                .Annotation("Npgsql:NullsDistinct", false);

            migrationBuilder.CreateIndex(
                name: "ix_linked_whatsapp_group_chat_id",
                table: "linked_whatsapp_group",
                column: "chat_id",
                unique: true
            );

            migrationBuilder.NotifyChangesOf("whatsapp_session");
            migrationBuilder.NotifyChangesOf("linked_whatsapp_group");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "inbox_whatsapp");

            migrationBuilder.DropTable(name: "linked_whatsapp_group");

            migrationBuilder.DropTable(name: "whatsapp_session");
        }
    }
}
