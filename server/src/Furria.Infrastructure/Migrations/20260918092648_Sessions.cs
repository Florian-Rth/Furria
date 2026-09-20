using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Sessions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "session",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    start_year = table.Column<int>(type: "integer", nullable: false),
                    number = table.Column<int>(type: "integer", nullable: true),
                    motto = table.Column<string>(
                        type: "character varying(160)",
                        maxLength: 160,
                        nullable: true
                    ),
                    artwork_svg = table.Column<string>(
                        type: "character varying(200000)",
                        maxLength: 200000,
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
                    table.PrimaryKey("pk_session", x => x.id);
                    table.CheckConstraint("ck_session_number", "number IS NULL OR number > 0");
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_session_number",
                table: "session",
                column: "number",
                unique: true,
                filter: "number IS NOT NULL"
            );

            migrationBuilder.CreateIndex(
                name: "ix_session_start_year",
                table: "session",
                column: "start_year",
                unique: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "session");
        }
    }
}
