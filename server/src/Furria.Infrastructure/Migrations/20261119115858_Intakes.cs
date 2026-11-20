using System;
using Furria.Infrastructure.Changes;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Intakes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "intake",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    started_by_person_id = table.Column<int>(type: "integer", nullable: true),
                    member_from = table.Column<DateOnly>(type: "date", nullable: true),
                    label = table.Column<string>(
                        type: "character varying(80)",
                        maxLength: 80,
                        nullable: true
                    ),
                    token_seed = table.Column<string>(
                        type: "character varying(22)",
                        maxLength: 22,
                        nullable: true
                    ),
                    token_hash = table.Column<string>(
                        type: "character varying(43)",
                        maxLength: 43,
                        nullable: false
                    ),
                    expires_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    submitted_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    completed_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    discarded_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    person_id = table.Column<int>(type: "integer", nullable: true),
                    first_name = table.Column<string>(
                        type: "character varying(128)",
                        maxLength: 128,
                        nullable: true
                    ),
                    last_name = table.Column<string>(
                        type: "character varying(128)",
                        maxLength: 128,
                        nullable: true
                    ),
                    birth_date = table.Column<DateOnly>(type: "date", nullable: true),
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
                    phone = table.Column<string>(
                        type: "character varying(64)",
                        maxLength: 64,
                        nullable: true
                    ),
                    email = table.Column<string>(
                        type: "character varying(256)",
                        maxLength: 256,
                        nullable: true
                    ),
                    contact_visible_to_members = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    version = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("pk_intake", x => x.id);
                    table.CheckConstraint(
                        "ck_intake_completed_after_submission",
                        "completed_at IS NULL OR submitted_at IS NOT NULL"
                    );
                    table.CheckConstraint(
                        "ck_intake_details_only_while_awaiting_review",
                        "(first_name IS NULL AND last_name IS NULL AND birth_date IS NULL AND street IS NULL AND zip IS NULL AND city IS NULL AND phone IS NULL AND email IS NULL AND NOT contact_visible_to_members) OR (submitted_at IS NOT NULL AND completed_at IS NULL AND discarded_at IS NULL)"
                    );
                    table.CheckConstraint("ck_intake_expiry", "expires_at > created_at");
                    table.CheckConstraint(
                        "ck_intake_label",
                        "label IS NULL OR length(btrim(label)) > 0"
                    );
                    table.CheckConstraint(
                        "ck_intake_one_ending",
                        "completed_at IS NULL OR discarded_at IS NULL"
                    );
                    table.CheckConstraint(
                        "ck_intake_person_once_completed",
                        "person_id IS NULL OR completed_at IS NOT NULL"
                    );
                    table.CheckConstraint(
                        "ck_intake_seed_only_while_undecided",
                        "token_seed IS NULL OR (completed_at IS NULL AND discarded_at IS NULL)"
                    );
                    table.ForeignKey(
                        name: "fk_intake_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                    table.ForeignKey(
                        name: "fk_intake_person_started_by_person_id",
                        column: x => x.started_by_person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "intake_group",
                columns: table => new
                {
                    intake_id = table.Column<int>(type: "integer", nullable: false),
                    group_id = table.Column<int>(type: "integer", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_intake_group", x => new { x.intake_id, x.group_id });
                    table.ForeignKey(
                        name: "fk_intake_group_group_group_id",
                        column: x => x.group_id,
                        principalTable: "group",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_intake_group_intake_intake_id",
                        column: x => x.intake_id,
                        principalTable: "intake",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_intake_created_at",
                table: "intake",
                column: "created_at"
            );

            migrationBuilder.CreateIndex(
                name: "ix_intake_person_id",
                table: "intake",
                column: "person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_intake_started_by_person_id",
                table: "intake",
                column: "started_by_person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_intake_token_hash",
                table: "intake",
                column: "token_hash",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_intake_group_group_id",
                table: "intake_group",
                column: "group_id"
            );

            migrationBuilder.NotifyChangesOf("intake");
            migrationBuilder.NotifyChangesOf("intake_group");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "intake_group");

            migrationBuilder.DropTable(name: "intake");
        }
    }
}
