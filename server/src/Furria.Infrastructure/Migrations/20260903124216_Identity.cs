using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Identity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "person",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    first_name = table.Column<string>(
                        type: "character varying(128)",
                        maxLength: 128,
                        nullable: false
                    ),
                    last_name = table.Column<string>(
                        type: "character varying(128)",
                        maxLength: 128,
                        nullable: false
                    ),
                    email = table.Column<string>(
                        type: "character varying(256)",
                        maxLength: 256,
                        nullable: true
                    ),
                    phone = table.Column<string>(
                        type: "character varying(64)",
                        maxLength: 64,
                        nullable: true
                    ),
                    street = table.Column<string>(
                        type: "character varying(256)",
                        maxLength: 256,
                        nullable: true
                    ),
                    zip = table.Column<string>(
                        type: "character varying(16)",
                        maxLength: 16,
                        nullable: true
                    ),
                    city = table.Column<string>(
                        type: "character varying(128)",
                        maxLength: 128,
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
                    table.PrimaryKey("pk_person", x => x.id);
                }
            );

            migrationBuilder.CreateTable(
                name: "account",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    person_id = table.Column<int>(type: "integer", nullable: false),
                    is_disabled = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    user_name = table.Column<string>(
                        type: "character varying(256)",
                        maxLength: 256,
                        nullable: true
                    ),
                    normalized_user_name = table.Column<string>(
                        type: "character varying(256)",
                        maxLength: 256,
                        nullable: true
                    ),
                    email = table.Column<string>(
                        type: "character varying(256)",
                        maxLength: 256,
                        nullable: true
                    ),
                    normalized_email = table.Column<string>(
                        type: "character varying(256)",
                        maxLength: 256,
                        nullable: true
                    ),
                    email_confirmed = table.Column<bool>(type: "boolean", nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: true),
                    security_stamp = table.Column<string>(type: "text", nullable: true),
                    concurrency_stamp = table.Column<string>(type: "text", nullable: true),
                    phone_number = table.Column<string>(type: "text", nullable: true),
                    phone_number_confirmed = table.Column<bool>(type: "boolean", nullable: false),
                    two_factor_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    lockout_end = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    lockout_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    access_failed_count = table.Column<int>(type: "integer", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_account", x => x.id);
                    table.ForeignKey(
                        name: "fk_account_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "membership",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    person_id = table.Column<int>(type: "integer", nullable: false),
                    type = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    status = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    started_at = table.Column<DateOnly>(type: "date", nullable: false),
                    ended_at = table.Column<DateOnly>(type: "date", nullable: true),
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
                    table.PrimaryKey("pk_membership", x => x.id);
                    table.ForeignKey(
                        name: "fk_membership_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "account_claim",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    claim_type = table.Column<string>(type: "text", nullable: true),
                    claim_value = table.Column<string>(type: "text", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_account_claim", x => x.id);
                    table.ForeignKey(
                        name: "fk_account_claim_account_user_id",
                        column: x => x.user_id,
                        principalTable: "account",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "account_login",
                columns: table => new
                {
                    login_provider = table.Column<string>(type: "text", nullable: false),
                    provider_key = table.Column<string>(type: "text", nullable: false),
                    provider_display_name = table.Column<string>(type: "text", nullable: true),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey(
                        "pk_account_login",
                        x => new { x.login_provider, x.provider_key }
                    );
                    table.ForeignKey(
                        name: "fk_account_login_account_user_id",
                        column: x => x.user_id,
                        principalTable: "account",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "account_token",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    login_provider = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    value = table.Column<string>(type: "text", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey(
                        "pk_account_token",
                        x => new
                        {
                            x.user_id,
                            x.login_provider,
                            x.name,
                        }
                    );
                    table.ForeignKey(
                        name: "fk_account_token_account_user_id",
                        column: x => x.user_id,
                        principalTable: "account",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "refresh_token",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    account_id = table.Column<int>(type: "integer", nullable: false),
                    token_hash = table.Column<string>(
                        type: "character varying(43)",
                        maxLength: 43,
                        nullable: false
                    ),
                    family_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    expires_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    revoked_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    revoked_reason = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: true
                    ),
                    replaced_by_id = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_refresh_token", x => x.id);
                    table.CheckConstraint("ck_refresh_token_expiry", "expires_at > created_at");
                    table.CheckConstraint(
                        "ck_refresh_token_revocation",
                        "(revoked_at IS NULL) = (revoked_reason IS NULL)"
                    );
                    table.ForeignKey(
                        name: "fk_refresh_token_account_account_id",
                        column: x => x.account_id,
                        principalTable: "account",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_account_normalized_email",
                table: "account",
                column: "normalized_email",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_account_normalized_user_name",
                table: "account",
                column: "normalized_user_name",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_account_person_id",
                table: "account",
                column: "person_id",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_account_claim_user_id",
                table: "account_claim",
                column: "user_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_account_login_user_id",
                table: "account_login",
                column: "user_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_membership_person_id",
                table: "membership",
                column: "person_id",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_membership_status",
                table: "membership",
                column: "status"
            );

            migrationBuilder.CreateIndex(
                name: "ix_person_last_name_first_name",
                table: "person",
                columns: new[] { "last_name", "first_name" }
            );

            migrationBuilder.CreateIndex(
                name: "ix_refresh_token_account_id",
                table: "refresh_token",
                column: "account_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_refresh_token_expires_at",
                table: "refresh_token",
                column: "expires_at"
            );

            migrationBuilder.CreateIndex(
                name: "ix_refresh_token_family_id",
                table: "refresh_token",
                column: "family_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_refresh_token_replaced_by_id",
                table: "refresh_token",
                column: "replaced_by_id",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_refresh_token_token_hash",
                table: "refresh_token",
                column: "token_hash",
                unique: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "account_claim");

            migrationBuilder.DropTable(name: "account_login");

            migrationBuilder.DropTable(name: "account_token");

            migrationBuilder.DropTable(name: "membership");

            migrationBuilder.DropTable(name: "refresh_token");

            migrationBuilder.DropTable(name: "account");

            migrationBuilder.DropTable(name: "person");
        }
    }
}
