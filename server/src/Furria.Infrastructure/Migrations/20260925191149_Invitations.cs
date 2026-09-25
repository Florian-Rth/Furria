using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Invitations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "account_event",
                columns: table => new
                {
                    id = table
                        .Column<long>(type: "bigint", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    person_id = table.Column<int>(type: "integer", nullable: false),
                    kind = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    actor_person_id = table.Column<int>(type: "integer", nullable: true),
                    at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_account_event", x => x.id);
                    table.ForeignKey(
                        name: "fk_account_event_person_actor_person_id",
                        column: x => x.actor_person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                    table.ForeignKey(
                        name: "fk_account_event_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "invitation",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    person_id = table.Column<int>(type: "integer", nullable: false),
                    purpose = table.Column<string>(
                        type: "character varying(16)",
                        maxLength: 16,
                        nullable: false
                    ),
                    channel = table.Column<string>(
                        type: "character varying(16)",
                        maxLength: 16,
                        nullable: false
                    ),
                    token_hash = table.Column<string>(
                        type: "character varying(43)",
                        maxLength: 43,
                        nullable: false
                    ),
                    code_hash = table.Column<string>(
                        type: "character varying(43)",
                        maxLength: 43,
                        nullable: true
                    ),
                    issued_by_person_id = table.Column<int>(type: "integer", nullable: true),
                    issued_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    expires_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    redeemed_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    voided_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    is_reminder = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_invitation", x => x.id);
                    table.CheckConstraint(
                        "ck_invitation_code_in_person_only",
                        "code_hash IS NULL OR channel = 'InPerson'"
                    );
                    table.CheckConstraint("ck_invitation_expiry", "expires_at > issued_at");
                    table.CheckConstraint(
                        "ck_invitation_single_ending",
                        "redeemed_at IS NULL OR voided_at IS NULL"
                    );
                    table.ForeignKey(
                        name: "fk_invitation_person_issued_by_person_id",
                        column: x => x.issued_by_person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                    table.ForeignKey(
                        name: "fk_invitation_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_account_event_actor_person_id",
                table: "account_event",
                column: "actor_person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_account_event_person_id_at",
                table: "account_event",
                columns: new[] { "person_id", "at" }
            );

            migrationBuilder.CreateIndex(
                name: "ix_invitation_issued_by_person_id",
                table: "invitation",
                column: "issued_by_person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_invitation_person_id",
                table: "invitation",
                column: "person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_invitation_person_id_live",
                table: "invitation",
                column: "person_id",
                unique: true,
                filter: "redeemed_at IS NULL AND voided_at IS NULL"
            );

            migrationBuilder.CreateIndex(
                name: "ix_invitation_token_hash",
                table: "invitation",
                column: "token_hash",
                unique: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "account_event");

            migrationBuilder.DropTable(name: "invitation");
        }
    }
}
