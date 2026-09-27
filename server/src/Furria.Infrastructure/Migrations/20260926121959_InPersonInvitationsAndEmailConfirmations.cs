using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InPersonInvitationsAndEmailConfirmations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "email_confirmation",
                columns: table => new
                {
                    id = table
                        .Column<long>(type: "bigint", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    purpose = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    invitation_id = table.Column<int>(type: "integer", nullable: true),
                    normalized_email = table.Column<string>(
                        type: "character varying(256)",
                        maxLength: 256,
                        nullable: false
                    ),
                    code_hash = table.Column<string>(
                        type: "character varying(43)",
                        maxLength: 43,
                        nullable: false
                    ),
                    issued_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    expires_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    failed_attempts = table.Column<int>(
                        type: "integer",
                        nullable: false,
                        defaultValue: 0
                    ),
                    consumed_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    voided_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_email_confirmation", x => x.id);
                    table.CheckConstraint("ck_email_confirmation_expiry", "expires_at > issued_at");
                    table.CheckConstraint(
                        "ck_email_confirmation_failed_attempts",
                        "failed_attempts BETWEEN 0 AND 5"
                    );
                    table.CheckConstraint(
                        "ck_email_confirmation_redemption_subject",
                        "purpose <> 'InvitationRedemption' OR invitation_id IS NOT NULL"
                    );
                    table.CheckConstraint(
                        "ck_email_confirmation_single_ending",
                        "consumed_at IS NULL OR voided_at IS NULL"
                    );
                    table.ForeignKey(
                        name: "fk_email_confirmation_invitation_invitation_id",
                        column: x => x.invitation_id,
                        principalTable: "invitation",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_invitation_code_hash",
                table: "invitation",
                column: "code_hash",
                filter: "code_hash IS NOT NULL AND redeemed_at IS NULL AND voided_at IS NULL"
            );

            migrationBuilder.CreateIndex(
                name: "ix_email_confirmation_invitation_id",
                table: "email_confirmation",
                column: "invitation_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_email_confirmation_subject_live",
                table: "email_confirmation",
                columns: new[] { "purpose", "invitation_id" },
                unique: true,
                filter: "invitation_id IS NOT NULL AND consumed_at IS NULL AND voided_at IS NULL"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "email_confirmation");

            migrationBuilder.DropIndex(name: "ix_invitation_code_hash", table: "invitation");
        }
    }
}
