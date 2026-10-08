using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Events : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_calendar_entry_kind",
                table: "calendar_entry"
            );

            migrationBuilder.CreateTable(
                name: "event",
                columns: table => new
                {
                    calendar_entry_id = table.Column<int>(type: "integer", nullable: false),
                    doors_open_at = table.Column<TimeOnly>(
                        type: "time without time zone",
                        nullable: true
                    ),
                    teaser = table.Column<string>(
                        type: "character varying(160)",
                        maxLength: 160,
                        nullable: false
                    ),
                    age_hint = table.Column<string>(
                        type: "character varying(40)",
                        maxLength: 40,
                        nullable: true
                    ),
                    price_cents = table.Column<int>(type: "integer", nullable: true),
                    presale_starts_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    ticket_availability = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false,
                        defaultValue: "Available"
                    ),
                    cancelled_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    created_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false,
                        defaultValueSql: "now()"
                    ),
                    updated_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false,
                        defaultValueSql: "now()"
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_event", x => x.calendar_entry_id);
                    table.CheckConstraint(
                        "ck_event_price_cents",
                        "price_cents IS NULL OR price_cents >= 0"
                    );
                    table.CheckConstraint(
                        "ck_event_ticket_availability",
                        "ticket_availability IN ('Available', 'FewLeft', 'SoldOut')"
                    );
                    table.ForeignKey(
                        name: "fk_event_calendar_entry_calendar_entry_id",
                        column: x => x.calendar_entry_id,
                        principalTable: "calendar_entry",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_calendar_entry_event_public",
                table: "calendar_entry",
                sql: "kind <> 'Event' OR (visibility = 'Public' AND owner_group_id IS NULL)"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_calendar_entry_kind",
                table: "calendar_entry",
                sql: "kind IN ('Training', 'Rehearsal', 'Performance', 'Meeting', 'Party', 'Other', 'Event')"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "event");

            migrationBuilder.DropCheckConstraint(
                name: "ck_calendar_entry_event_public",
                table: "calendar_entry"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_calendar_entry_kind",
                table: "calendar_entry"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_calendar_entry_kind",
                table: "calendar_entry",
                sql: "kind IN ('Training', 'Rehearsal', 'Performance', 'Meeting', 'Party', 'Other')"
            );
        }
    }
}
