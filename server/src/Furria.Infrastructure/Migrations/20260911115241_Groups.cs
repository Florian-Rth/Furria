using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Groups : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "group",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    name = table.Column<string>(
                        type: "character varying(80)",
                        maxLength: 80,
                        nullable: false
                    ),
                    description = table.Column<string>(
                        type: "character varying(400)",
                        maxLength: 400,
                        nullable: false
                    ),
                    is_recruiting = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    archived_on = table.Column<DateOnly>(type: "date", nullable: true),
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
                    table.PrimaryKey("pk_group", x => x.id);
                }
            );

            migrationBuilder.CreateTable(
                name: "group_admin",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    group_id = table.Column<int>(type: "integer", nullable: false),
                    person_id = table.Column<int>(type: "integer", nullable: false),
                    function = table.Column<string>(
                        type: "character varying(64)",
                        maxLength: 64,
                        nullable: true
                    ),
                    since_on = table.Column<DateOnly>(type: "date", nullable: false),
                    until_on = table.Column<DateOnly>(type: "date", nullable: true),
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
                    table.PrimaryKey("pk_group_admin", x => x.id);
                    table.CheckConstraint(
                        "ck_group_admin_period",
                        "until_on IS NULL OR until_on >= since_on"
                    );
                    table.ForeignKey(
                        name: "fk_group_admin_group_group_id",
                        column: x => x.group_id,
                        principalTable: "group",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_group_admin_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "group_membership",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    group_id = table.Column<int>(type: "integer", nullable: false),
                    person_id = table.Column<int>(type: "integer", nullable: false),
                    joined_on = table.Column<DateOnly>(type: "date", nullable: false),
                    left_on = table.Column<DateOnly>(type: "date", nullable: true),
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
                    table.PrimaryKey("pk_group_membership", x => x.id);
                    table.CheckConstraint(
                        "ck_group_membership_period",
                        "left_on IS NULL OR left_on >= joined_on"
                    );
                    table.ForeignKey(
                        name: "fk_group_membership_group_group_id",
                        column: x => x.group_id,
                        principalTable: "group",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_group_membership_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_group_name_lookup",
                table: "group",
                column: "name"
            );

            migrationBuilder.CreateIndex(
                name: "ix_group_admin_group_id_person_id_open",
                table: "group_admin",
                columns: new[] { "group_id", "person_id" },
                unique: true,
                filter: "until_on IS NULL"
            );

            migrationBuilder.CreateIndex(
                name: "ix_group_admin_person_id",
                table: "group_admin",
                column: "person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_group_membership_group_id_person_id",
                table: "group_membership",
                columns: new[] { "group_id", "person_id" }
            );

            migrationBuilder.CreateIndex(
                name: "ix_group_membership_group_id_person_id_open",
                table: "group_membership",
                columns: new[] { "group_id", "person_id" },
                unique: true,
                filter: "left_on IS NULL"
            );

            migrationBuilder.CreateIndex(
                name: "ix_group_membership_person_id",
                table: "group_membership",
                column: "person_id"
            );

            migrationBuilder.Sql(
                "CREATE UNIQUE INDEX ix_group_name_active ON \"group\" (lower(name)) WHERE archived_on IS NULL;"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "group_admin");

            migrationBuilder.DropTable(name: "group_membership");

            migrationBuilder.DropTable(name: "group");
        }
    }
}
