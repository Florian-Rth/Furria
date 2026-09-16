using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Roles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "role",
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
                    table.PrimaryKey("pk_role", x => x.id);
                }
            );

            migrationBuilder.CreateTable(
                name: "role_holding",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    role_id = table.Column<int>(type: "integer", nullable: false),
                    person_id = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("pk_role_holding", x => x.id);
                    table.CheckConstraint(
                        "ck_role_holding_period",
                        "until_on IS NULL OR until_on >= since_on"
                    );
                    table.ForeignKey(
                        name: "fk_role_holding_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict
                    );
                    table.ForeignKey(
                        name: "fk_role_holding_role_role_id",
                        column: x => x.role_id,
                        principalTable: "role",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "role_permission",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    role_id = table.Column<int>(type: "integer", nullable: false),
                    permission_key = table.Column<string>(
                        type: "character varying(64)",
                        maxLength: 64,
                        nullable: false
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
                    table.PrimaryKey("pk_role_permission", x => x.id);
                    table.ForeignKey(
                        name: "fk_role_permission_role_role_id",
                        column: x => x.role_id,
                        principalTable: "role",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_role_name_lookup",
                table: "role",
                column: "name"
            );

            migrationBuilder.CreateIndex(
                name: "ix_role_holding_person_id",
                table: "role_holding",
                column: "person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_role_holding_role_id_person_id_open",
                table: "role_holding",
                columns: new[] { "role_id", "person_id" },
                unique: true,
                filter: "until_on IS NULL"
            );

            migrationBuilder.CreateIndex(
                name: "ix_role_permission_role_id_permission_key",
                table: "role_permission",
                columns: new[] { "role_id", "permission_key" },
                unique: true
            );

            migrationBuilder.Sql(
                "CREATE UNIQUE INDEX ix_role_name_active ON role (lower(name)) WHERE archived_on IS NULL;"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "role_holding");

            migrationBuilder.DropTable(name: "role_permission");

            migrationBuilder.DropTable(name: "role");
        }
    }
}
