using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PushOutbox : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "outbox_calendar_push",
                columns: table => new
                {
                    id = table
                        .Column<long>(type: "bigint", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    reason = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    calendar_entry_id = table.Column<int>(type: "integer", nullable: false),
                    actor_person_id = table.Column<int>(type: "integer", nullable: true),
                    person_ids = table.Column<List<int>>(type: "integer[]", nullable: false),
                    title = table.Column<string>(
                        type: "character varying(120)",
                        maxLength: 120,
                        nullable: false
                    ),
                    starts_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    ends_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    venue_name = table.Column<string>(
                        type: "character varying(80)",
                        maxLength: 80,
                        nullable: true
                    ),
                    kind = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    asks_for_response = table.Column<bool>(type: "boolean", nullable: false),
                    owner_group_id = table.Column<int>(type: "integer", nullable: true),
                    participating_group_ids = table.Column<List<int>>(
                        type: "integer[]",
                        nullable: false
                    ),
                    audience = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    audience_group_ids = table.Column<List<int>>(
                        type: "integer[]",
                        nullable: false
                    ),
                    audience_person_ids = table.Column<List<int>>(
                        type: "integer[]",
                        nullable: false
                    ),
                    attempt = table.Column<int>(type: "integer", nullable: false),
                    next_attempt_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_outbox_calendar_push", x => x.id);
                    table.CheckConstraint("ck_outbox_calendar_push_attempt", "attempt >= 1");
                    table.CheckConstraint(
                        "ck_outbox_calendar_push_audience",
                        "audience IN ('Club', 'Groups', 'People')"
                    );
                    table.CheckConstraint(
                        "ck_outbox_calendar_push_kind",
                        "kind IN ('Plain', 'Training', 'Trip', 'Event')"
                    );
                    table.CheckConstraint(
                        "ck_outbox_calendar_push_reason",
                        "reason IN ('AsksForResponse', 'Chosen', 'Moved', 'Deleted')"
                    );
                    table.CheckConstraint(
                        "ck_outbox_calendar_push_recipients",
                        "reason = 'AsksForResponse' OR cardinality(person_ids) > 0"
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "outbox_push",
                columns: table => new
                {
                    id = table
                        .Column<long>(type: "bigint", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    account_id = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(
                        type: "character varying(160)",
                        maxLength: 160,
                        nullable: false
                    ),
                    body = table.Column<string>(
                        type: "character varying(300)",
                        maxLength: 300,
                        nullable: false
                    ),
                    url = table.Column<string>(
                        type: "character varying(200)",
                        maxLength: 200,
                        nullable: false
                    ),
                    tag = table.Column<string>(
                        type: "character varying(64)",
                        maxLength: 64,
                        nullable: false
                    ),
                    expires_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    attempt = table.Column<int>(type: "integer", nullable: false),
                    next_attempt_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_outbox_push", x => x.id);
                    table.CheckConstraint("ck_outbox_push_attempt", "attempt >= 1");
                    table.ForeignKey(
                        name: "fk_outbox_push_account_account_id",
                        column: x => x.account_id,
                        principalTable: "account",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_outbox_calendar_push_next_attempt_at",
                table: "outbox_calendar_push",
                column: "next_attempt_at"
            );

            migrationBuilder.CreateIndex(
                name: "ix_outbox_push_account_id",
                table: "outbox_push",
                column: "account_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_outbox_push_next_attempt_at",
                table: "outbox_push",
                column: "next_attempt_at"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "outbox_calendar_push");

            migrationBuilder.DropTable(name: "outbox_push");
        }
    }
}
