using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RegistryFacts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "membership");

            migrationBuilder.AddColumn<DateOnly>(
                name: "birth_date",
                table: "person",
                type: "date",
                nullable: true
            );

            migrationBuilder.AddColumn<bool>(
                name: "contact_visible_to_members",
                table: "person",
                type: "boolean",
                nullable: false,
                defaultValue: false
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
                    started_on = table.Column<DateOnly>(type: "date", nullable: false),
                    ended_on = table.Column<DateOnly>(type: "date", nullable: true),
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
                    table.CheckConstraint(
                        "ck_membership_period",
                        "ended_on IS NULL OR ended_on >= started_on"
                    );
                    table.ForeignKey(
                        name: "fk_membership_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "fee_reduction",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    person_id = table.Column<int>(type: "integer", nullable: false),
                    basis = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    first_session_year = table.Column<int>(type: "integer", nullable: false),
                    last_session_year = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("pk_fee_reduction", x => x.id);
                    table.CheckConstraint(
                        "ck_fee_reduction_founding",
                        "first_session_year >= 1971"
                    );
                    table.CheckConstraint(
                        "ck_fee_reduction_span",
                        "last_session_year >= first_session_year"
                    );
                    table.ForeignKey(
                        name: "fk_fee_reduction_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "membership_pause",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    membership_id = table.Column<int>(type: "integer", nullable: false),
                    first_session_year = table.Column<int>(type: "integer", nullable: false),
                    last_session_year = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("pk_membership_pause", x => x.id);
                    table.CheckConstraint(
                        "ck_membership_pause_founding",
                        "first_session_year >= 1971"
                    );
                    table.CheckConstraint(
                        "ck_membership_pause_span",
                        "last_session_year IS NULL OR last_session_year >= first_session_year"
                    );
                    table.ForeignKey(
                        name: "fk_membership_pause_membership_membership_id",
                        column: x => x.membership_id,
                        principalTable: "membership",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_fee_reduction_person_id",
                table: "fee_reduction",
                column: "person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_membership_person_id",
                table: "membership",
                column: "person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_membership_person_id_open",
                table: "membership",
                column: "person_id",
                unique: true,
                filter: "ended_on IS NULL"
            );

            migrationBuilder.CreateIndex(
                name: "ix_membership_pause_membership_id",
                table: "membership_pause",
                column: "membership_id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "fee_reduction");

            migrationBuilder.DropTable(name: "membership_pause");

            migrationBuilder.DropTable(name: "membership");

            migrationBuilder.DropColumn(name: "birth_date", table: "person");

            migrationBuilder.DropColumn(name: "contact_visible_to_members", table: "person");

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
        }
    }
}
