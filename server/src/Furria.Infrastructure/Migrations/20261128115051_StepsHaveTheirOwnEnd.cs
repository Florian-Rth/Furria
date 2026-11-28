using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class StepsHaveTheirOwnEnd : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "end_seconds",
                table: "act_step",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0
            );

            migrationBuilder.AddColumn<int>(
                name: "end_source_media_item_id",
                table: "act_step",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.AddColumn<bool>(
                name: "needs_check",
                table: "act_step",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );

            migrationBuilder.Sql(
                """
                WITH final_track AS (
                    SELECT DISTINCT ON (track.act_id)
                        track.act_id,
                        track.media_item_id,
                        COALESCE(item.duration_seconds, 0) AS duration_seconds
                    FROM act_final_track track
                    JOIN media_item item ON item.id = track.media_item_id
                    WHERE track.adopted_at IS NOT NULL
                    ORDER BY track.act_id, track.version DESC
                ),
                cut AS (
                    SELECT
                        final_track.act_id,
                        final_track.media_item_id AS source_media_item_id,
                        0::double precision AS cut_start,
                        final_track.duration_seconds AS cut_end,
                        0 AS song_position,
                        0 AS song_id,
                        0::bigint AS piece_order
                    FROM final_track
                    UNION ALL
                    SELECT
                        song.act_id,
                        song.media_item_id,
                        piece.cut_start,
                        piece.cut_end,
                        song.position,
                        song.id,
                        piece.piece_order
                    FROM act_song song
                    JOIN media_item item ON item.id = song.media_item_id
                    CROSS JOIN LATERAL (
                        SELECT
                            (element.value ->> 'startSeconds')::double precision AS cut_start,
                            (element.value ->> 'endSeconds')::double precision AS cut_end,
                            element.ordinality AS piece_order
                        FROM jsonb_array_elements(song.pieces) WITH ORDINALITY AS element(value, ordinality)
                        UNION ALL
                        SELECT 0, COALESCE(item.duration_seconds, 0), 1
                        WHERE jsonb_array_length(song.pieces) = 0
                    ) piece
                    WHERE NOT EXISTS (SELECT 1 FROM final_track WHERE final_track.act_id = song.act_id)
                ),
                placed AS (
                    SELECT
                        cut.*,
                        ROW_NUMBER() OVER played AS cut_order,
                        COALESCE(
                            SUM(cut.cut_end - cut.cut_start)
                                OVER (played ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING),
                            0
                        ) AS offset_seconds
                    FROM cut
                    WINDOW played AS (PARTITION BY cut.act_id ORDER BY cut.song_position, cut.song_id, cut.piece_order)
                ),
                located AS (
                    SELECT DISTINCT ON (step.id)
                        step.id,
                        step.act_id,
                        placed.offset_seconds + step.start_seconds - placed.cut_start AS timeline_seconds
                    FROM act_step step
                    JOIN placed
                        ON placed.act_id = step.act_id
                        AND placed.source_media_item_id = step.start_source_media_item_id
                        AND step.start_seconds >= placed.cut_start
                        AND step.start_seconds <= placed.cut_end
                    ORDER BY
                        step.id,
                        step.start_seconds < placed.cut_end DESC,
                        CASE WHEN step.start_seconds < placed.cut_end THEN placed.cut_order ELSE -placed.cut_order END
                ),
                ordered AS (
                    SELECT
                        located.id,
                        located.act_id,
                        located.timeline_seconds,
                        ROW_NUMBER() OVER following AS position,
                        LEAD(located.id) OVER following AS next_step_id,
                        LEAD(located.timeline_seconds) OVER following AS next_seconds
                    FROM located
                    WINDOW following AS (PARTITION BY located.act_id ORDER BY located.timeline_seconds, located.id)
                ),
                music_length AS (
                    SELECT placed.act_id, SUM(placed.cut_end - placed.cut_start) AS length_seconds
                    FROM placed
                    GROUP BY placed.act_id
                ),
                bordered AS (
                    SELECT
                        ordered.id,
                        ordered.act_id,
                        ordered.next_step_id,
                        ordered.position = 1 AND ordered.timeline_seconds > 1e-9 AS starts_late,
                        COALESCE(ordered.next_seconds, music_length.length_seconds) AS end_timeline_seconds
                    FROM ordered
                    JOIN music_length ON music_length.act_id = ordered.act_id
                ),
                ending AS (
                    SELECT DISTINCT ON (bordered.id)
                        bordered.id,
                        bordered.act_id,
                        bordered.starts_late,
                        placed.source_media_item_id,
                        CASE
                            WHEN next.start_source_media_item_id = placed.source_media_item_id
                                AND next.start_seconds > placed.cut_start
                                AND next.start_seconds <= placed.cut_end
                            THEN next.start_seconds
                            ELSE placed.cut_end
                        END AS end_seconds
                    FROM bordered
                    LEFT JOIN act_step next ON next.id = bordered.next_step_id
                    JOIN placed
                        ON placed.act_id = bordered.act_id
                        AND bordered.end_timeline_seconds > placed.offset_seconds + 1e-9
                        AND bordered.end_timeline_seconds
                            <= placed.offset_seconds + placed.cut_end - placed.cut_start + 1e-9
                    ORDER BY bordered.id, placed.cut_order
                ),
                opening AS (
                    SELECT DISTINCT ON (placed.act_id)
                        placed.act_id,
                        placed.source_media_item_id,
                        placed.cut_start
                    FROM placed
                    WHERE placed.cut_end > placed.cut_start
                    ORDER BY placed.act_id, placed.cut_order
                )
                UPDATE act_step step
                SET
                    end_source_media_item_id = ending.source_media_item_id,
                    end_seconds = ending.end_seconds,
                    start_source_media_item_id = CASE
                        WHEN ending.starts_late THEN opening.source_media_item_id
                        ELSE step.start_source_media_item_id
                    END,
                    start_seconds = CASE
                        WHEN ending.starts_late THEN opening.cut_start
                        ELSE step.start_seconds
                    END
                FROM ending
                JOIN opening ON opening.act_id = ending.act_id
                WHERE step.id = ending.id;

                UPDATE act_step
                SET end_source_media_item_id = start_source_media_item_id, end_seconds = start_seconds
                WHERE end_source_media_item_id = 0;

                ALTER TABLE act_step
                    ALTER COLUMN end_source_media_item_id DROP DEFAULT,
                    ALTER COLUMN end_seconds DROP DEFAULT,
                    ALTER COLUMN needs_check DROP DEFAULT;
                """
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_step_end_source_media_item_id",
                table: "act_step",
                column: "end_source_media_item_id"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_act_step_end",
                table: "act_step",
                sql: "end_seconds >= 0"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_act_step_media_item_end_source_media_item_id",
                table: "act_step",
                column: "end_source_media_item_id",
                principalTable: "media_item",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_act_step_media_item_end_source_media_item_id",
                table: "act_step"
            );

            migrationBuilder.DropIndex(
                name: "ix_act_step_end_source_media_item_id",
                table: "act_step"
            );

            migrationBuilder.DropCheckConstraint(name: "ck_act_step_end", table: "act_step");

            migrationBuilder.DropColumn(name: "end_seconds", table: "act_step");

            migrationBuilder.DropColumn(name: "end_source_media_item_id", table: "act_step");

            migrationBuilder.DropColumn(name: "needs_check", table: "act_step");
        }
    }
}
