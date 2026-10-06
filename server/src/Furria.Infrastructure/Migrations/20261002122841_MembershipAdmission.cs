using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MembershipAdmission : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "admitted_at",
                table: "membership",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "admitted_by_person_id",
                table: "membership",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<bool>(
                name: "guardian_consent_confirmed",
                table: "membership",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );

            migrationBuilder.CreateIndex(
                name: "ix_membership_admitted_by_person_id",
                table: "membership",
                column: "admitted_by_person_id"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_membership_admission",
                table: "membership",
                sql: "admitted_at IS NOT NULL OR (admitted_by_person_id IS NULL AND NOT guardian_consent_confirmed)"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_membership_person_admitted_by_person_id",
                table: "membership",
                column: "admitted_by_person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_membership_person_admitted_by_person_id",
                table: "membership"
            );

            migrationBuilder.DropIndex(
                name: "ix_membership_admitted_by_person_id",
                table: "membership"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_membership_admission",
                table: "membership"
            );

            migrationBuilder.DropColumn(name: "admitted_at", table: "membership");

            migrationBuilder.DropColumn(name: "admitted_by_person_id", table: "membership");

            migrationBuilder.DropColumn(name: "guardian_consent_confirmed", table: "membership");
        }
    }
}
