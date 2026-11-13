using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AnnouncementAttendance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "answers_until",
                table: "announcement",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "attendance_closed_at",
                table: "announcement",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "attendance_closed_by_person_id",
                table: "announcement",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "attendance_last_reminded_at",
                table: "announcement",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "attendance_position",
                table: "announcement",
                type: "integer",
                nullable: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_announcement_attendance_closed_by_person_id",
                table: "announcement",
                column: "attendance_closed_by_person_id"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_announcement_attendance_closer",
                table: "announcement",
                sql: "attendance_closed_by_person_id IS NULL OR attendance_closed_at IS NOT NULL"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_announcement_attendance_position",
                table: "announcement",
                sql: "attendance_position IS NULL OR attendance_position >= 0"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_announcement_attendance_state",
                table: "announcement",
                sql: "attendance_position IS NOT NULL OR (answers_until IS NULL AND attendance_closed_at IS NULL AND attendance_closed_by_person_id IS NULL AND attendance_last_reminded_at IS NULL)"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_announcement_person_attendance_closed_by_person_id",
                table: "announcement",
                column: "attendance_closed_by_person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_announcement_person_attendance_closed_by_person_id",
                table: "announcement"
            );

            migrationBuilder.DropIndex(
                name: "ix_announcement_attendance_closed_by_person_id",
                table: "announcement"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_announcement_attendance_closer",
                table: "announcement"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_announcement_attendance_position",
                table: "announcement"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_announcement_attendance_state",
                table: "announcement"
            );

            migrationBuilder.DropColumn(name: "answers_until", table: "announcement");

            migrationBuilder.DropColumn(name: "attendance_closed_at", table: "announcement");

            migrationBuilder.DropColumn(
                name: "attendance_closed_by_person_id",
                table: "announcement"
            );

            migrationBuilder.DropColumn(name: "attendance_last_reminded_at", table: "announcement");

            migrationBuilder.DropColumn(name: "attendance_position", table: "announcement");
        }
    }
}
