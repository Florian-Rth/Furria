using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ClubHub : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "artwork_svg",
                table: "session",
                newName: "signet_svg"
            );

            migrationBuilder.AddColumn<bool>(
                name: "portrait_is_public",
                table: "person",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );

            migrationBuilder.AddColumn<string>(
                name: "portrait_url",
                table: "person",
                type: "character varying(512)",
                maxLength: 512,
                nullable: true
            );

            migrationBuilder.CreateTable(
                name: "venue",
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
                    table.PrimaryKey("pk_venue", x => x.id);
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_venue_name",
                table: "venue",
                column: "name",
                unique: true
            );

            migrationBuilder.InsertData(
                table: "session",
                columns: new[] { "start_year", "motto" },
                values: new object[] { 2026, "FURRIA — Der Mittelpunkt des Universums" }
            );

            migrationBuilder.InsertData(
                table: "venue",
                columns: new[] { "name", "sort_order" },
                values: new object[,]
                {
                    { "Sporthalle", 1 },
                    { "Vereinsraum", 2 },
                    { "Lager", 3 },
                }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(table: "session", keyColumn: "start_year", keyValue: 2026);

            migrationBuilder.DeleteData(
                table: "venue",
                keyColumn: "name",
                keyValues: new object[] { "Sporthalle", "Vereinsraum", "Lager" }
            );

            migrationBuilder.DropTable(name: "venue");

            migrationBuilder.DropColumn(name: "portrait_is_public", table: "person");

            migrationBuilder.DropColumn(name: "portrait_url", table: "person");

            migrationBuilder.RenameColumn(
                name: "signet_svg",
                table: "session",
                newName: "artwork_svg"
            );
        }
    }
}
