using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Passkeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "name",
                table: "account_token",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text"
            );

            migrationBuilder.AlterColumn<string>(
                name: "login_provider",
                table: "account_token",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text"
            );

            migrationBuilder.AlterColumn<string>(
                name: "provider_key",
                table: "account_login",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text"
            );

            migrationBuilder.AlterColumn<string>(
                name: "login_provider",
                table: "account_login",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text"
            );

            migrationBuilder.AlterColumn<string>(
                name: "phone_number",
                table: "account",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true
            );

            migrationBuilder.CreateTable(
                name: "account_passkey",
                columns: table => new
                {
                    credential_id = table.Column<byte[]>(
                        type: "bytea",
                        maxLength: 1024,
                        nullable: false
                    ),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    data = table.Column<string>(type: "jsonb", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_account_passkey", x => x.credential_id);
                    table.ForeignKey(
                        name: "fk_account_passkey_account_user_id",
                        column: x => x.user_id,
                        principalTable: "account",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "passkey_challenge",
                columns: table => new
                {
                    id = table
                        .Column<long>(type: "bigint", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    purpose = table.Column<string>(
                        type: "character varying(16)",
                        maxLength: 16,
                        nullable: false
                    ),
                    id_hash = table.Column<string>(
                        type: "character varying(43)",
                        maxLength: 43,
                        nullable: false
                    ),
                    account_id = table.Column<int>(type: "integer", nullable: true),
                    state = table.Column<string>(type: "text", nullable: false),
                    issued_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    expires_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_passkey_challenge", x => x.id);
                    table.CheckConstraint(
                        "ck_passkey_challenge_creation_subject",
                        "(purpose = 'Creation') = (account_id IS NOT NULL)"
                    );
                    table.CheckConstraint("ck_passkey_challenge_expiry", "expires_at > issued_at");
                    table.ForeignKey(
                        name: "fk_passkey_challenge_account_account_id",
                        column: x => x.account_id,
                        principalTable: "account",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_account_passkey_user_id",
                table: "account_passkey",
                column: "user_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_passkey_challenge_account_id",
                table: "passkey_challenge",
                column: "account_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_passkey_challenge_expires_at",
                table: "passkey_challenge",
                column: "expires_at"
            );

            migrationBuilder.CreateIndex(
                name: "ix_passkey_challenge_id_hash",
                table: "passkey_challenge",
                column: "id_hash",
                unique: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "account_passkey");

            migrationBuilder.DropTable(name: "passkey_challenge");

            migrationBuilder.AlterColumn<string>(
                name: "name",
                table: "account_token",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(128)",
                oldMaxLength: 128
            );

            migrationBuilder.AlterColumn<string>(
                name: "login_provider",
                table: "account_token",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(128)",
                oldMaxLength: 128
            );

            migrationBuilder.AlterColumn<string>(
                name: "provider_key",
                table: "account_login",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(128)",
                oldMaxLength: 128
            );

            migrationBuilder.AlterColumn<string>(
                name: "login_provider",
                table: "account_login",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(128)",
                oldMaxLength: 128
            );

            migrationBuilder.AlterColumn<string>(
                name: "phone_number",
                table: "account",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256,
                oldNullable: true
            );
        }
    }
}
