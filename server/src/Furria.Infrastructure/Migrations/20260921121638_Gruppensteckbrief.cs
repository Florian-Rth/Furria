using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Gruppensteckbrief : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "founded_year",
                table: "group",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "tone",
                table: "group",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true
            );

            migrationBuilder.CreateTable(
                name: "calendar_entry_group",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    calendar_entry_id = table.Column<int>(type: "integer", nullable: false),
                    group_id = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("pk_calendar_entry_group", x => x.id);
                    table.ForeignKey(
                        name: "fk_calendar_entry_group_calendar_entry_calendar_entry_id",
                        column: x => x.calendar_entry_id,
                        principalTable: "calendar_entry",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_calendar_entry_group_group_group_id",
                        column: x => x.group_id,
                        principalTable: "group",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "group_training_slot",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    group_id = table.Column<int>(type: "integer", nullable: false),
                    venue_id = table.Column<int>(type: "integer", nullable: true),
                    weekday = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    starts_at = table.Column<TimeOnly>(
                        type: "time without time zone",
                        nullable: false
                    ),
                    duration_minutes = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("pk_group_training_slot", x => x.id);
                    table.CheckConstraint(
                        "ck_group_training_slot_duration",
                        "duration_minutes > 0 AND duration_minutes <= 480"
                    );
                    table.CheckConstraint(
                        "ck_group_training_slot_weekday",
                        "weekday IN ('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')"
                    );
                    table.ForeignKey(
                        name: "fk_group_training_slot_group_group_id",
                        column: x => x.group_id,
                        principalTable: "group",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_group_training_slot_venue_venue_id",
                        column: x => x.venue_id,
                        principalTable: "venue",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                }
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_group_founded_year",
                table: "group",
                sql: "founded_year IS NULL OR founded_year >= 1800"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_group_tone",
                table: "group",
                sql: "tone IS NULL OR tone IN ('Clay', 'Olive', 'Lime', 'Fern', 'Teal', 'Indigo', 'Iris', 'Violet', 'Orchid', 'Rose')"
            );

            migrationBuilder.CreateIndex(
                name: "ix_calendar_entry_group_calendar_entry_id_group_id",
                table: "calendar_entry_group",
                columns: new[] { "calendar_entry_id", "group_id" },
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_calendar_entry_group_group_id",
                table: "calendar_entry_group",
                column: "group_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_group_training_slot_group_id",
                table: "group_training_slot",
                column: "group_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_group_training_slot_venue_id",
                table: "group_training_slot",
                column: "venue_id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "calendar_entry_group");

            migrationBuilder.DropTable(name: "group_training_slot");

            migrationBuilder.DropCheckConstraint(name: "ck_group_founded_year", table: "group");

            migrationBuilder.DropCheckConstraint(name: "ck_group_tone", table: "group");

            migrationBuilder.DropColumn(name: "founded_year", table: "group");

            migrationBuilder.DropColumn(name: "tone", table: "group");
        }
    }
}
