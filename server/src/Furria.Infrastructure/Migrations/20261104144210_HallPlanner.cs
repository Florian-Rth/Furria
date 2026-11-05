using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class HallPlanner : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "without_table_plan",
                table: "event",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );

            migrationBuilder.CreateTable(
                name: "hall",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    venue_id = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(
                        type: "character varying(60)",
                        maxLength: 60,
                        nullable: false,
                        collation: "de-DE-x-icu"
                    ),
                    document = table.Column<string>(type: "jsonb", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("pk_hall", x => x.id);
                    table.CheckConstraint(
                        "ck_hall_document_shape",
                        "jsonb_typeof(document) = 'object' AND jsonb_typeof(document -> 'elements') = 'array'"
                    );
                    table.ForeignKey(
                        name: "fk_hall_venue_venue_id",
                        column: x => x.venue_id,
                        principalTable: "venue",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "seating_standard",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false),
                    comfortable_chair_spacing_cm = table.Column<int>(
                        type: "integer",
                        nullable: false
                    ),
                    maximum_chair_spacing_cm = table.Column<int>(type: "integer", nullable: false),
                    chair_depth_cm = table.Column<int>(type: "integer", nullable: false),
                    aisle_width_cm = table.Column<int>(type: "integer", nullable: false),
                    exit_clearance_cm = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("pk_seating_standard", x => x.id);
                    table.CheckConstraint("ck_seating_standard_singleton", "id = 1");
                }
            );

            migrationBuilder.CreateTable(
                name: "table_type",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    name = table.Column<string>(
                        type: "character varying(60)",
                        maxLength: 60,
                        nullable: false,
                        collation: "de-DE-x-icu"
                    ),
                    shape = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    length_cm = table.Column<int>(type: "integer", nullable: false),
                    width_cm = table.Column<int>(type: "integer", nullable: false),
                    seats_at_ends = table.Column<bool>(type: "boolean", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    archived_on = table.Column<DateOnly>(type: "date", nullable: true),
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
                    table.PrimaryKey("pk_table_type", x => x.id);
                    table.CheckConstraint("ck_table_type_shape", "shape IN ('Rectangle', 'Round')");
                    table.CheckConstraint("ck_table_type_size", "length_cm > 0 AND width_cm > 0");
                }
            );

            migrationBuilder.CreateTable(
                name: "table_plan",
                columns: table => new
                {
                    calendar_entry_id = table.Column<int>(type: "integer", nullable: false),
                    hall_id = table.Column<int>(type: "integer", nullable: false),
                    document = table.Column<string>(type: "jsonb", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("pk_table_plan", x => x.calendar_entry_id);
                    table.CheckConstraint(
                        "ck_table_plan_document_shape",
                        "jsonb_typeof(document) = 'object' AND jsonb_typeof(document -> 'rows') = 'array' AND jsonb_typeof(document -> 'groups') = 'array'"
                    );
                    table.ForeignKey(
                        name: "fk_table_plan_event_calendar_entry_id",
                        column: x => x.calendar_entry_id,
                        principalTable: "event",
                        principalColumn: "calendar_entry_id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_table_plan_hall_hall_id",
                        column: x => x.hall_id,
                        principalTable: "hall",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict
                    );
                }
            );

            migrationBuilder.Sql(
                """
                INSERT INTO seating_standard (id, comfortable_chair_spacing_cm, maximum_chair_spacing_cm, chair_depth_cm, aisle_width_cm, exit_clearance_cm)
                VALUES (1, 60, 45, 50, 120, 120);
                INSERT INTO table_type (name, shape, length_cm, width_cm, seats_at_ends, sort_order)
                VALUES ('Biertisch', 'Rectangle', 220, 50, false, 1),
                       ('Tisch', 'Rectangle', 120, 80, true, 2),
                       ('Rund', 'Round', 160, 160, false, 3);
                """
            );

            migrationBuilder.CreateIndex(
                name: "ix_hall_venue_id_name",
                table: "hall",
                columns: new[] { "venue_id", "name" },
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_table_plan_hall_id",
                table: "table_plan",
                column: "hall_id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "seating_standard");

            migrationBuilder.DropTable(name: "table_plan");

            migrationBuilder.DropTable(name: "table_type");

            migrationBuilder.DropTable(name: "hall");

            migrationBuilder.DropColumn(name: "without_table_plan", table: "event");
        }
    }
}
