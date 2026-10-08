using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class TicketRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(name: "ck_to_do_mark_kind", table: "to_do_mark");

            migrationBuilder.CreateTable(
                name: "ticket_request",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    event_id = table.Column<int>(type: "integer", nullable: false),
                    ticket_count = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(
                        type: "character varying(80)",
                        maxLength: 80,
                        nullable: false,
                        collation: "de-DE-x-icu"
                    ),
                    phone = table.Column<string>(
                        type: "character varying(31)",
                        maxLength: 31,
                        nullable: false
                    ),
                    email = table.Column<string>(
                        type: "character varying(254)",
                        maxLength: 254,
                        nullable: false
                    ),
                    message = table.Column<string>(
                        type: "character varying(500)",
                        maxLength: 500,
                        nullable: true
                    ),
                    requested_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_ticket_request", x => x.id);
                    table.CheckConstraint(
                        "ck_ticket_request_ticket_count",
                        "ticket_count BETWEEN 1 AND 10"
                    );
                    table.ForeignKey(
                        name: "fk_ticket_request_event_event_id",
                        column: x => x.event_id,
                        principalTable: "event",
                        principalColumn: "calendar_entry_id",
                        onDelete: ReferentialAction.Restrict
                    );
                }
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_to_do_mark_kind",
                table: "to_do_mark",
                sql: "kind IN ('NeverInvited', 'ReminderDue', 'InPersonOnly', 'BirthDateUnknown', 'KeyToTakeBack', 'ClubRecordGap', 'ApplicationWaiting', 'TicketRequestWaiting')"
            );

            migrationBuilder.CreateIndex(
                name: "ix_ticket_request_event_id",
                table: "ticket_request",
                column: "event_id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "ticket_request");

            migrationBuilder.DropCheckConstraint(name: "ck_to_do_mark_kind", table: "to_do_mark");

            migrationBuilder.AddCheckConstraint(
                name: "ck_to_do_mark_kind",
                table: "to_do_mark",
                sql: "kind IN ('NeverInvited', 'ReminderDue', 'InPersonOnly', 'BirthDateUnknown', 'KeyToTakeBack', 'ClubRecordGap', 'ApplicationWaiting')"
            );
        }
    }
}
