using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChoreographyVersions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "choreography_version",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    choreography_id = table.Column<int>(type: "integer", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false),
                    kind = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    restored_from_version = table.Column<int>(type: "integer", nullable: true),
                    document = table.Column<string>(type: "jsonb", nullable: false),
                    saved_by_person_id = table.Column<int>(type: "integer", nullable: true),
                    saved_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false,
                        defaultValueSql: "now()"
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_choreography_version", x => x.id);
                    table.CheckConstraint(
                        "ck_choreography_version_document",
                        "jsonb_typeof(document) = 'object' AND jsonb_typeof(document -> 'tracks') = 'array'"
                    );
                    table.CheckConstraint(
                        "ck_choreography_version_kind",
                        "kind IN ('Saved', 'Restored', 'SpotRemoved', 'MusicAdopted')"
                    );
                    table.CheckConstraint(
                        "ck_choreography_version_restored_from",
                        "(kind = 'Restored') = (restored_from_version IS NOT NULL)"
                    );
                    table.CheckConstraint("ck_choreography_version_version", "version >= 1");
                    table.ForeignKey(
                        name: "fk_choreography_version_choreography_choreography_id",
                        column: x => x.choreography_id,
                        principalTable: "choreography",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_choreography_version_person_saved_by_person_id",
                        column: x => x.saved_by_person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_choreography_version_choreography_id_version",
                table: "choreography_version",
                columns: new[] { "choreography_id", "version" },
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_choreography_version_saved_by_person_id",
                table: "choreography_version",
                column: "saved_by_person_id"
            );

            migrationBuilder.Sql(
                """
                INSERT INTO choreography_version (choreography_id, version, kind, document, saved_at)
                SELECT id, version, 'Saved', document, updated_at
                FROM choreography;
                """
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "choreography_version");
        }
    }
}
