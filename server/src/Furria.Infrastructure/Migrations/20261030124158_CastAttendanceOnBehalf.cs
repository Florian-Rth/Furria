using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CastAttendanceOnBehalf : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_recorded_on_behalf",
                table: "attendance_response",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );

            migrationBuilder.AddColumn<int>(
                name: "recorded_by_person_id",
                table: "attendance_response",
                type: "integer",
                nullable: true
            );

            migrationBuilder.CreateTable(
                name: "attendance_response_change",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    calendar_entry_id = table.Column<int>(type: "integer", nullable: false),
                    person_id = table.Column<int>(type: "integer", nullable: false),
                    answer = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    is_recorded_on_behalf = table.Column<bool>(type: "boolean", nullable: false),
                    recorded_by_person_id = table.Column<int>(type: "integer", nullable: true),
                    recorded_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false,
                        defaultValueSql: "now()"
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_attendance_response_change", x => x.id);
                    table.CheckConstraint(
                        "ck_attendance_response_change_answer",
                        "answer IN ('Yes', 'No', 'Maybe')"
                    );
                    table.ForeignKey(
                        name: "fk_attendance_response_change_calendar_entry_calendar_entry_id",
                        column: x => x.calendar_entry_id,
                        principalTable: "calendar_entry",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_attendance_response_change_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_attendance_response_change_person_recorded_by_person_id",
                        column: x => x.recorded_by_person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_attendance_response_recorded_by_person_id",
                table: "attendance_response",
                column: "recorded_by_person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_attendance_response_change_calendar_entry_id_person_id",
                table: "attendance_response_change",
                columns: new[] { "calendar_entry_id", "person_id" }
            );

            migrationBuilder.CreateIndex(
                name: "ix_attendance_response_change_person_id",
                table: "attendance_response_change",
                column: "person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_attendance_response_change_recorded_by_person_id",
                table: "attendance_response_change",
                column: "recorded_by_person_id"
            );

            migrationBuilder.Sql(
                """
                INSERT INTO attendance_response_change
                    (calendar_entry_id, person_id, answer, is_recorded_on_behalf, recorded_at)
                SELECT calendar_entry_id, person_id, answer, false, updated_at
                FROM attendance_response
                """
            );

            migrationBuilder.AddForeignKey(
                name: "fk_attendance_response_person_recorded_by_person_id",
                table: "attendance_response",
                column: "recorded_by_person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_attendance_response_person_recorded_by_person_id",
                table: "attendance_response"
            );

            migrationBuilder.DropTable(name: "attendance_response_change");

            migrationBuilder.DropIndex(
                name: "ix_attendance_response_recorded_by_person_id",
                table: "attendance_response"
            );

            migrationBuilder.DropColumn(
                name: "is_recorded_on_behalf",
                table: "attendance_response"
            );

            migrationBuilder.DropColumn(
                name: "recorded_by_person_id",
                table: "attendance_response"
            );
        }
    }
}
