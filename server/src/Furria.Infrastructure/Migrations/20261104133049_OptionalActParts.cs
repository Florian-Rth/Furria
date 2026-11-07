using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class OptionalActParts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(name: "ix_act_part_first_step_id", table: "act_part");

            migrationBuilder.AddColumn<int>(
                name: "last_step_id",
                table: "act_part",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.Sql(
                """
                WITH adopted AS (
                    SELECT DISTINCT ON (track.act_id) track.act_id, track.media_item_id
                    FROM act_final_track AS track
                    WHERE track.adopted_at IS NOT NULL
                    ORDER BY track.act_id, track.version DESC
                ),
                played AS (
                    SELECT step.id, step.act_id, 0 AS song_position, 0 AS song_id,
                           0::bigint AS piece_index, step.start_seconds
                    FROM act_step AS step
                    JOIN adopted
                      ON adopted.act_id = step.act_id
                     AND adopted.media_item_id = step.start_source_media_item_id
                    UNION ALL
                    (
                        SELECT DISTINCT ON (step.id) step.id, step.act_id, song.position, song.id,
                               piece.piece_index, step.start_seconds
                        FROM act_step AS step
                        JOIN act_song AS song
                          ON song.act_id = step.act_id
                         AND song.media_item_id = step.start_source_media_item_id
                        CROSS JOIN LATERAL (
                            SELECT min(element.piece_index) AS piece_index
                            FROM jsonb_array_elements(song.pieces)
                                 WITH ORDINALITY AS element(piece, piece_index)
                            WHERE (element.piece ->> 'startSeconds')::double precision <= step.start_seconds
                              AND step.start_seconds < (element.piece ->> 'endSeconds')::double precision
                        ) AS piece
                        WHERE piece.piece_index IS NOT NULL
                          AND NOT EXISTS (SELECT 1 FROM adopted WHERE adopted.act_id = step.act_id)
                        ORDER BY step.id, song.position, song.id
                    )
                ),
                ordered AS (
                    SELECT played.id, played.act_id,
                           row_number() OVER (
                               PARTITION BY played.act_id
                               ORDER BY played.song_position, played.song_id, played.piece_index,
                                        played.start_seconds, played.id
                           ) AS step_rank,
                           count(*) OVER (PARTITION BY played.act_id) AS step_count
                    FROM played
                ),
                anchored AS (
                    SELECT part.id, part.act_id, ordered.step_count,
                           row_number() OVER (PARTITION BY part.act_id ORDER BY ordered.step_rank) AS part_rank,
                           lead(ordered.step_rank) OVER (
                               PARTITION BY part.act_id ORDER BY ordered.step_rank
                           ) AS next_rank
                    FROM act_part AS part
                    JOIN ordered ON ordered.id = part.first_step_id
                )
                UPDATE act_part AS part
                SET first_step_id = CASE WHEN anchored.part_rank = 1 THEN opening.id ELSE part.first_step_id END,
                    last_step_id = closing.id
                FROM anchored
                JOIN ordered AS opening
                  ON opening.act_id = anchored.act_id AND opening.step_rank = 1
                JOIN ordered AS closing
                  ON closing.act_id = anchored.act_id
                 AND closing.step_rank = COALESCE(anchored.next_rank - 1, anchored.step_count)
                WHERE part.id = anchored.id;

                UPDATE act_part SET last_step_id = first_step_id WHERE last_step_id = 0;
                """
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_part_first_step_id",
                table: "act_part",
                column: "first_step_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_part_last_step_id",
                table: "act_part",
                column: "last_step_id"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_act_part_act_step_last_step_id",
                table: "act_part",
                column: "last_step_id",
                principalTable: "act_step",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_act_part_act_step_last_step_id",
                table: "act_part"
            );

            migrationBuilder.DropIndex(name: "ix_act_part_first_step_id", table: "act_part");

            migrationBuilder.DropIndex(name: "ix_act_part_last_step_id", table: "act_part");

            migrationBuilder.DropColumn(name: "last_step_id", table: "act_part");

            migrationBuilder.Sql(
                """
                DELETE FROM act_part AS later
                USING act_part AS earlier
                WHERE earlier.first_step_id = later.first_step_id
                  AND earlier.id < later.id;
                """
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_part_first_step_id",
                table: "act_part",
                column: "first_step_id",
                unique: true
            );
        }
    }
}
