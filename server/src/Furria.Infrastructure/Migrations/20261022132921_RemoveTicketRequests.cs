using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTicketRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "ticket_request");

            migrationBuilder.Sql(
                "DELETE FROM role_permission WHERE permission_key = 'ticket_requests.handle';"
            );
            migrationBuilder.Sql("DELETE FROM to_do_mark WHERE kind = 'TicketRequestWaiting';");
            migrationBuilder.Sql(
                "DELETE FROM outbox_mail WHERE template IN ('TicketRequestReceipt', 'TicketRequestArrival') OR recipient_kind = 'TicketRequest';"
            );

            migrationBuilder.DropCheckConstraint(name: "ck_to_do_mark_kind", table: "to_do_mark");

            migrationBuilder.AddCheckConstraint(
                name: "ck_to_do_mark_kind",
                table: "to_do_mark",
                sql: "kind IN ('NeverInvited', 'ReminderDue', 'InPersonOnly', 'BirthDateUnknown', 'KeyToTakeBack', 'ClubRecordGap', 'ApplicationWaiting')"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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
                    requested_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    ticket_count = table.Column<int>(type: "integer", nullable: false),
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
    }
}
