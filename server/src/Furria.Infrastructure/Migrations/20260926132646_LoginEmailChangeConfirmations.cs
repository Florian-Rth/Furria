using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class LoginEmailChangeConfirmations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_email_confirmation_subject_live",
                table: "email_confirmation"
            );

            migrationBuilder.AddColumn<int>(
                name: "account_id",
                table: "email_confirmation",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "email",
                table: "email_confirmation",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true
            );

            migrationBuilder.AddColumn<bool>(
                name: "updates_contact_email",
                table: "email_confirmation",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );

            migrationBuilder.CreateIndex(
                name: "ix_email_confirmation_account_id",
                table: "email_confirmation",
                column: "account_id"
            );

            migrationBuilder
                .CreateIndex(
                    name: "ix_email_confirmation_subject_live",
                    table: "email_confirmation",
                    columns: new[] { "purpose", "invitation_id", "account_id" },
                    unique: true,
                    filter: "consumed_at IS NULL AND voided_at IS NULL"
                )
                .Annotation("Npgsql:NullsDistinct", false);

            migrationBuilder.AddCheckConstraint(
                name: "ck_email_confirmation_contact_email_follow",
                table: "email_confirmation",
                sql: "purpose = 'LoginEmailChange' OR NOT updates_contact_email"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_email_confirmation_login_email_change_subject",
                table: "email_confirmation",
                sql: "purpose <> 'LoginEmailChange' OR (account_id IS NOT NULL AND email IS NOT NULL)"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_email_confirmation_single_subject",
                table: "email_confirmation",
                sql: "num_nonnulls(invitation_id, account_id) = 1"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_email_confirmation_account_account_id",
                table: "email_confirmation",
                column: "account_id",
                principalTable: "account",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_email_confirmation_account_account_id",
                table: "email_confirmation"
            );

            migrationBuilder.DropIndex(
                name: "ix_email_confirmation_account_id",
                table: "email_confirmation"
            );

            migrationBuilder.DropIndex(
                name: "ix_email_confirmation_subject_live",
                table: "email_confirmation"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_email_confirmation_contact_email_follow",
                table: "email_confirmation"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_email_confirmation_login_email_change_subject",
                table: "email_confirmation"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_email_confirmation_single_subject",
                table: "email_confirmation"
            );

            migrationBuilder.DropColumn(name: "account_id", table: "email_confirmation");

            migrationBuilder.DropColumn(name: "email", table: "email_confirmation");

            migrationBuilder.DropColumn(name: "updates_contact_email", table: "email_confirmation");

            migrationBuilder.CreateIndex(
                name: "ix_email_confirmation_subject_live",
                table: "email_confirmation",
                columns: new[] { "purpose", "invitation_id" },
                unique: true,
                filter: "invitation_id IS NOT NULL AND consumed_at IS NULL AND voided_at IS NULL"
            );
        }
    }
}
