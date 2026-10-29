using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class VenueOpeningHours : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "venue_opening_slot",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    venue_id = table.Column<int>(type: "integer", nullable: false),
                    weekday = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    opens = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    closes = table.Column<TimeOnly>(
                        type: "time without time zone",
                        nullable: false
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
                    table.PrimaryKey("pk_venue_opening_slot", x => x.id);
                    table.CheckConstraint("ck_venue_opening_slot_span", "closes > opens");
                    table.CheckConstraint(
                        "ck_venue_opening_slot_weekday",
                        "weekday IN ('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')"
                    );
                    table.ForeignKey(
                        name: "fk_venue_opening_slot_venue_venue_id",
                        column: x => x.venue_id,
                        principalTable: "venue",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_venue_opening_slot_venue_id",
                table: "venue_opening_slot",
                column: "venue_id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "venue_opening_slot");
        }
    }
}
