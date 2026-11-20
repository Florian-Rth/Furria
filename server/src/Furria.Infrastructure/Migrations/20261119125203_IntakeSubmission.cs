using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class IntakeSubmission : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "intake_id",
                table: "membership",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<bool>(
                name: "contact_email_unconfirmed",
                table: "invitation",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );

            migrationBuilder.CreateIndex(
                name: "ix_person_birth_date",
                table: "person",
                column: "birth_date"
            );

            migrationBuilder.CreateIndex(
                name: "ix_membership_intake_id",
                table: "membership",
                column: "intake_id",
                unique: true
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_membership_one_origin",
                table: "membership",
                sql: "admitted_at IS NULL OR intake_id IS NULL"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_membership_intake_intake_id",
                table: "membership",
                column: "intake_id",
                principalTable: "intake",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull
            );

            migrationBuilder.Sql(
                "CREATE INDEX ix_person_normalized_email ON person (upper(btrim(email, E' \\t\\n\\r'))) WHERE email IS NOT NULL;"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP INDEX ix_person_normalized_email;");

            migrationBuilder.DropForeignKey(
                name: "fk_membership_intake_intake_id",
                table: "membership"
            );

            migrationBuilder.DropIndex(name: "ix_person_birth_date", table: "person");

            migrationBuilder.DropIndex(name: "ix_membership_intake_id", table: "membership");

            migrationBuilder.DropCheckConstraint(
                name: "ck_membership_one_origin",
                table: "membership"
            );

            migrationBuilder.DropColumn(name: "intake_id", table: "membership");

            migrationBuilder.DropColumn(name: "contact_email_unconfirmed", table: "invitation");
        }
    }
}
