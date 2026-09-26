using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RecoveryContactEmailFollow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_email_confirmation_contact_email_follow",
                table: "email_confirmation"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddCheckConstraint(
                name: "ck_email_confirmation_contact_email_follow",
                table: "email_confirmation",
                sql: "purpose = 'LoginEmailChange' OR NOT updates_contact_email"
            );
        }
    }
}
