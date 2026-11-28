using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SongsAreReplacedInPlace : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_choreography_version_kind",
                table: "choreography_version"
            );

            migrationBuilder.Sql(
                "UPDATE choreography_version SET kind = 'MusicReplaced' WHERE kind = 'MusicAdopted';"
            );

            migrationBuilder.CreateTable(
                name: "act_music_replacement",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    act_id = table.Column<int>(type: "integer", nullable: false),
                    song_id = table.Column<int>(type: "integer", nullable: false),
                    before = table.Column<string>(type: "jsonb", nullable: false),
                    fingerprint = table.Column<string>(
                        type: "character(64)",
                        fixedLength: true,
                        maxLength: 64,
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_act_music_replacement", x => x.id);
                    table.CheckConstraint(
                        "ck_act_music_replacement_before",
                        "jsonb_typeof(before) = 'object'"
                    );
                    table.ForeignKey(
                        name: "fk_act_music_replacement_act_act_id",
                        column: x => x.act_id,
                        principalTable: "act",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_act_music_replacement_act_song_song_id",
                        column: x => x.song_id,
                        principalTable: "act_song",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_choreography_version_kind",
                table: "choreography_version",
                sql: "kind IN ('Saved', 'Restored', 'SpotRemoved', 'MusicReplaced')"
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_music_replacement_act_id",
                table: "act_music_replacement",
                column: "act_id",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_music_replacement_song_id",
                table: "act_music_replacement",
                column: "song_id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "act_music_replacement");

            migrationBuilder.DropCheckConstraint(
                name: "ck_choreography_version_kind",
                table: "choreography_version"
            );

            migrationBuilder.Sql(
                "UPDATE choreography_version SET kind = 'MusicAdopted' WHERE kind = 'MusicReplaced';"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_choreography_version_kind",
                table: "choreography_version",
                sql: "kind IN ('Saved', 'Restored', 'SpotRemoved', 'MusicAdopted')"
            );
        }
    }
}
