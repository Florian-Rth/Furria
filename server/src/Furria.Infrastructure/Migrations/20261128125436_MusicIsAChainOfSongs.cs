using System;
using Furria.Infrastructure.Changes;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MusicIsAChainOfSongs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "end_seconds",
                table: "act_song",
                type: "double precision",
                nullable: true
            );

            migrationBuilder.AddColumn<double>(
                name: "start_seconds",
                table: "act_song",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0
            );

            migrationBuilder.DropIndex(name: "ix_act_song_media_item_id", table: "act_song");

            migrationBuilder.Sql(
                """
                DELETE FROM act_song song
                WHERE EXISTS (
                    SELECT 1 FROM act_final_track track
                    WHERE track.act_id = song.act_id AND track.adopted_at IS NOT NULL
                );

                INSERT INTO act_song (act_id, media_item_id, position, first_beat_seconds, tempo_bpm)
                SELECT DISTINCT ON (track.act_id)
                    track.act_id, track.media_item_id, 0, track.first_beat_seconds, track.tempo_bpm
                FROM act_final_track track
                WHERE track.adopted_at IS NOT NULL
                ORDER BY track.act_id, track.version DESC;

                DELETE FROM media_item item
                USING act_final_track track
                WHERE track.media_item_id = item.id AND track.adopted_at IS NULL;

                WITH piece AS (
                    SELECT
                        song.id AS song_id,
                        song.act_id,
                        song.media_item_id,
                        song.position,
                        song.first_beat_seconds,
                        song.tempo_bpm,
                        cut.start_seconds,
                        cut.end_seconds,
                        cut.piece_order
                    FROM act_song song
                    CROSS JOIN LATERAL (
                        SELECT
                            (element.value ->> 'startSeconds')::double precision,
                            (element.value ->> 'endSeconds')::double precision,
                            element.ordinality
                        FROM jsonb_array_elements(song.pieces) WITH ORDINALITY AS element(value, ordinality)
                        UNION ALL
                        SELECT 0, NULL, 1
                        WHERE jsonb_array_length(song.pieces) = 0
                    ) cut(start_seconds, end_seconds, piece_order)
                ),
                numbered AS (
                    SELECT
                        piece.*,
                        ROW_NUMBER() OVER (
                            PARTITION BY piece.act_id
                            ORDER BY piece.position, piece.song_id, piece.piece_order
                        ) - 1 AS chain_position
                    FROM piece
                ),
                first_pieces AS (
                    UPDATE act_song song
                    SET
                        start_seconds = numbered.start_seconds,
                        end_seconds = numbered.end_seconds,
                        position = numbered.chain_position
                    FROM numbered
                    WHERE numbered.song_id = song.id AND numbered.piece_order = 1
                )
                INSERT INTO act_song (
                    act_id, media_item_id, position, start_seconds, end_seconds, first_beat_seconds, tempo_bpm
                )
                SELECT
                    numbered.act_id,
                    numbered.media_item_id,
                    numbered.chain_position,
                    numbered.start_seconds,
                    numbered.end_seconds,
                    numbered.first_beat_seconds,
                    numbered.tempo_bpm
                FROM numbered
                WHERE numbered.piece_order > 1;

                ALTER TABLE act_song ALTER COLUMN start_seconds DROP DEFAULT;
                """
            );

            migrationBuilder.DropCheckConstraint(name: "ck_act_song_pieces", table: "act_song");

            migrationBuilder.DropColumn(name: "pieces", table: "act_song");

            migrationBuilder.DropTable(name: "act_final_track_alignment");

            migrationBuilder.DropTable(name: "act_final_track");

            migrationBuilder.CreateIndex(
                name: "ix_act_song_media_item_id",
                table: "act_song",
                column: "media_item_id"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_act_song_cut",
                table: "act_song",
                sql: "start_seconds >= 0 AND (end_seconds IS NULL OR end_seconds > start_seconds)"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "pieces",
                table: "act_song",
                type: "jsonb",
                nullable: false,
                defaultValueSql: "'[]'::jsonb"
            );

            migrationBuilder.DropIndex(name: "ix_act_song_media_item_id", table: "act_song");

            migrationBuilder.Sql(
                """
                UPDATE act_song song
                SET pieces = jsonb_build_array(jsonb_build_object(
                    'startSeconds', song.start_seconds,
                    'endSeconds', COALESCE(song.end_seconds, item.duration_seconds)
                ))
                FROM media_item item
                WHERE item.id = song.media_item_id
                    AND (song.start_seconds > 0 OR song.end_seconds IS NOT NULL)
                    AND COALESCE(song.end_seconds, item.duration_seconds) > song.start_seconds;

                WITH sibling AS (
                    SELECT
                        song.id,
                        FIRST_VALUE(song.id) OVER file_songs AS keeper_id,
                        ROW_NUMBER() OVER file_songs AS song_order,
                        COUNT(*) OVER (PARTITION BY song.act_id, song.media_item_id) AS songs_of_file
                    FROM act_song song
                    WINDOW file_songs AS (
                        PARTITION BY song.act_id, song.media_item_id ORDER BY song.position, song.id
                    )
                ),
                merged AS (
                    SELECT
                        sibling.keeper_id,
                        jsonb_agg(
                            piece.value ORDER BY (piece.value ->> 'startSeconds')::double precision
                        ) AS pieces
                    FROM sibling
                    JOIN act_song song ON song.id = sibling.id
                    CROSS JOIN LATERAL jsonb_array_elements(song.pieces) AS piece(value)
                    WHERE sibling.songs_of_file > 1
                    GROUP BY sibling.keeper_id
                ),
                kept AS (
                    UPDATE act_song song
                    SET pieces = merged.pieces
                    FROM merged
                    WHERE song.id = merged.keeper_id
                )
                DELETE FROM act_song song
                USING sibling
                WHERE sibling.id = song.id AND sibling.song_order > 1;
                """
            );

            migrationBuilder.DropCheckConstraint(name: "ck_act_song_cut", table: "act_song");

            migrationBuilder.DropColumn(name: "end_seconds", table: "act_song");

            migrationBuilder.DropColumn(name: "start_seconds", table: "act_song");

            migrationBuilder.CreateTable(
                name: "act_final_track",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    act_id = table.Column<int>(type: "integer", nullable: false),
                    media_item_id = table.Column<int>(type: "integer", nullable: false),
                    adopted_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    created_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false,
                        defaultValueSql: "now()"
                    ),
                    first_beat_seconds = table.Column<double>(
                        type: "double precision",
                        nullable: true
                    ),
                    tempo_bpm = table.Column<double>(type: "double precision", nullable: true),
                    updated_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false,
                        defaultValueSql: "now()"
                    ),
                    version = table.Column<int>(type: "integer", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_act_final_track", x => x.id);
                    table.CheckConstraint(
                        "ck_act_final_track_beat_grid",
                        "(first_beat_seconds IS NULL OR first_beat_seconds >= 0) AND (tempo_bpm IS NULL OR tempo_bpm > 0)"
                    );
                    table.CheckConstraint("ck_act_final_track_version", "version >= 1");
                    table.ForeignKey(
                        name: "fk_act_final_track_act_act_id",
                        column: x => x.act_id,
                        principalTable: "act",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_act_final_track_media_item_media_item_id",
                        column: x => x.media_item_id,
                        principalTable: "media_item",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "act_final_track_alignment",
                columns: table => new
                {
                    final_track_id = table.Column<int>(type: "integer", nullable: false),
                    source_media_item_id = table.Column<int>(type: "integer", nullable: false),
                    from_seconds = table.Column<double>(type: "double precision", nullable: false),
                    offset_seconds = table.Column<double>(
                        type: "double precision",
                        nullable: false
                    ),
                    stretch = table.Column<double>(
                        type: "double precision",
                        nullable: false,
                        defaultValue: 1.0
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey(
                        "pk_act_final_track_alignment",
                        x => new
                        {
                            x.final_track_id,
                            x.source_media_item_id,
                            x.from_seconds,
                        }
                    );
                    table.ForeignKey(
                        name: "fk_act_final_track_alignment_act_final_track_final_track_id",
                        column: x => x.final_track_id,
                        principalTable: "act_final_track",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_act_final_track_alignment_media_item_source_media_item_id",
                        column: x => x.source_media_item_id,
                        principalTable: "media_item",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_song_media_item_id",
                table: "act_song",
                column: "media_item_id",
                unique: true
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_act_song_pieces",
                table: "act_song",
                sql: "jsonb_typeof(pieces) = 'array'"
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_final_track_act_id_version",
                table: "act_final_track",
                columns: new[] { "act_id", "version" },
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_final_track_media_item_id",
                table: "act_final_track",
                column: "media_item_id",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_final_track_alignment_source_media_item_id",
                table: "act_final_track_alignment",
                column: "source_media_item_id"
            );

            migrationBuilder.NotifyChangesOf("act_final_track");
            migrationBuilder.NotifyChangesOf("act_final_track_alignment");
        }
    }
}
