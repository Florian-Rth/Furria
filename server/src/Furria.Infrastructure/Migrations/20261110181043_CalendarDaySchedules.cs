using System;
using Furria.Infrastructure.Changes;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CalendarDaySchedules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "calendar_day_schedule",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    calendar_entry_id = table.Column<int>(type: "integer", nullable: false),
                    position = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(
                        type: "character varying(120)",
                        maxLength: 120,
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
                    table.PrimaryKey("pk_calendar_day_schedule", x => x.id);
                    table.CheckConstraint("ck_calendar_day_schedule_position", "position >= 0");
                    table.CheckConstraint(
                        "ck_calendar_day_schedule_title",
                        "title IS NULL OR btrim(title) <> ''"
                    );
                    table.ForeignKey(
                        name: "fk_calendar_day_schedule_calendar_entry_calendar_entry_id",
                        column: x => x.calendar_entry_id,
                        principalTable: "calendar_entry",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "calendar_day_schedule_step",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    day_schedule_id = table.Column<int>(type: "integer", nullable: false),
                    day = table.Column<int>(type: "integer", nullable: false),
                    time = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    text = table.Column<string>(
                        type: "character varying(120)",
                        maxLength: 120,
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
                    table.PrimaryKey("pk_calendar_day_schedule_step", x => x.id);
                    table.CheckConstraint("ck_calendar_day_schedule_step_day", "day >= 0");
                    table.CheckConstraint(
                        "ck_calendar_day_schedule_step_text",
                        "btrim(text) <> ''"
                    );
                    table.ForeignKey(
                        name: "fk_calendar_day_schedule_step_day_schedule_id",
                        column: x => x.day_schedule_id,
                        principalTable: "calendar_day_schedule",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_calendar_day_schedule_calendar_entry_id",
                table: "calendar_day_schedule",
                column: "calendar_entry_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_calendar_day_schedule_step_day_schedule_id_day_time",
                table: "calendar_day_schedule_step",
                columns: new[] { "day_schedule_id", "day", "time" }
            );

            migrationBuilder.NotifyChangesOf("calendar_day_schedule");
            migrationBuilder.NotifyChangesOf("calendar_day_schedule_step");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "calendar_day_schedule_step");

            migrationBuilder.DropTable(name: "calendar_day_schedule");
        }
    }
}
