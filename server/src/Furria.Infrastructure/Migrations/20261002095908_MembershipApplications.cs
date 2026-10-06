using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MembershipApplications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "person_id",
                table: "outbox_mail",
                newName: "recipient_id"
            );

            migrationBuilder.AlterColumn<string>(
                name: "template",
                table: "outbox_mail",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(32)",
                oldMaxLength: 32
            );

            migrationBuilder.AddColumn<string>(
                name: "recipient_kind",
                table: "outbox_mail",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "Person"
            );

            migrationBuilder.Sql(
                "ALTER TABLE outbox_mail ALTER COLUMN recipient_kind DROP DEFAULT;"
            );

            migrationBuilder.CreateTable(
                name: "membership_application",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    first_name = table.Column<string>(
                        type: "character varying(80)",
                        maxLength: 80,
                        nullable: false,
                        collation: "de-DE-x-icu"
                    ),
                    last_name = table.Column<string>(
                        type: "character varying(80)",
                        maxLength: 80,
                        nullable: false,
                        collation: "de-DE-x-icu"
                    ),
                    birth_date = table.Column<DateOnly>(type: "date", nullable: false),
                    street = table.Column<string>(
                        type: "character varying(120)",
                        maxLength: 120,
                        nullable: false
                    ),
                    zip = table.Column<string>(
                        type: "character varying(5)",
                        maxLength: 5,
                        nullable: false
                    ),
                    city = table.Column<string>(
                        type: "character varying(80)",
                        maxLength: 80,
                        nullable: false
                    ),
                    email = table.Column<string>(
                        type: "character varying(254)",
                        maxLength: 254,
                        nullable: false
                    ),
                    phone = table.Column<string>(
                        type: "character varying(31)",
                        maxLength: 31,
                        nullable: true
                    ),
                    confirmation_token_hash = table.Column<string>(
                        type: "character varying(43)",
                        maxLength: 43,
                        nullable: false
                    ),
                    submitted_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    confirmed_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_membership_application", x => x.id);
                    table.CheckConstraint(
                        "ck_membership_application_confirmed_after_submission",
                        "confirmed_at IS NULL OR confirmed_at >= submitted_at"
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_membership_application_confirmation_token_hash",
                table: "membership_application",
                column: "confirmation_token_hash",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_membership_application_submitted_at",
                table: "membership_application",
                column: "submitted_at",
                filter: "confirmed_at IS NULL"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "membership_application");

            migrationBuilder.Sql("DELETE FROM outbox_mail WHERE recipient_kind <> 'Person';");

            migrationBuilder.DropColumn(name: "recipient_kind", table: "outbox_mail");

            migrationBuilder.RenameColumn(
                name: "recipient_id",
                table: "outbox_mail",
                newName: "person_id"
            );

            migrationBuilder.AlterColumn<string>(
                name: "template",
                table: "outbox_mail",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(64)",
                oldMaxLength: 64
            );
        }
    }
}
