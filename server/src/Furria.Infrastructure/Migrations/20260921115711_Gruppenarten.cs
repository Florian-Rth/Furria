using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Gruppenarten : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "group_kind_id",
                table: "group",
                type: "integer",
                nullable: true
            );

            migrationBuilder.CreateTable(
                name: "group_kind",
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
                        nullable: false,
                        collation: "de-DE-x-icu"
                    ),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("pk_group_kind", x => x.id);
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_group_group_kind_id",
                table: "group",
                column: "group_kind_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_group_kind_name_lookup",
                table: "group_kind",
                column: "name"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_group_group_kind_group_kind_id",
                table: "group",
                column: "group_kind_id",
                principalTable: "group_kind",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull
            );

            migrationBuilder.Sql(
                "CREATE UNIQUE INDEX ix_group_kind_name_active ON group_kind (lower(name)) WHERE archived_on IS NULL;"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP INDEX IF EXISTS ix_group_kind_name_active;");

            migrationBuilder.DropForeignKey(
                name: "fk_group_group_kind_group_kind_id",
                table: "group"
            );

            migrationBuilder.DropTable(name: "group_kind");

            migrationBuilder.DropIndex(name: "ix_group_group_kind_id", table: "group");

            migrationBuilder.DropColumn(name: "group_kind_id", table: "group");
        }
    }
}
