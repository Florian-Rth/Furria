using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class StudioCuts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(name: "ix_act_video_media_item_id", table: "act_video");

            migrationBuilder.DropCheckConstraint(name: "ck_act_song_cut", table: "act_song");

            migrationBuilder.DropPrimaryKey(
                name: "pk_act_final_track_alignment",
                table: "act_final_track_alignment"
            );

            migrationBuilder.AddColumn<string>(
                name: "pieces",
                table: "act_song",
                type: "jsonb",
                nullable: false,
                defaultValueSql: "'[]'::jsonb"
            );

            migrationBuilder.Sql(
                """
                UPDATE act_song AS song
                SET pieces = jsonb_build_array(
                    jsonb_build_object(
                        'startSeconds', song.start_seconds,
                        'endSeconds', COALESCE(song.end_seconds, item.duration_seconds)
                    )
                )
                FROM media_item AS item
                WHERE item.id = song.media_item_id
                  AND COALESCE(song.end_seconds, item.duration_seconds) > song.start_seconds;
                """
            );

            migrationBuilder.DropColumn(name: "end_seconds", table: "act_song");

            migrationBuilder.DropColumn(name: "start_seconds", table: "act_song");

            migrationBuilder.AddColumn<double>(
                name: "clip_end_seconds",
                table: "act_video",
                type: "double precision",
                nullable: true
            );

            migrationBuilder.AddColumn<double>(
                name: "clip_start_seconds",
                table: "act_video",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0
            );

            migrationBuilder.AddColumn<double>(
                name: "from_seconds",
                table: "act_final_track_alignment",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0
            );

            migrationBuilder.AddPrimaryKey(
                name: "pk_act_final_track_alignment",
                table: "act_final_track_alignment",
                columns: new[] { "final_track_id", "source_media_item_id", "from_seconds" }
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_video_media_item_id",
                table: "act_video",
                column: "media_item_id"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_act_video_clip",
                table: "act_video",
                sql: "clip_start_seconds >= 0 AND (clip_end_seconds IS NULL OR clip_end_seconds > clip_start_seconds)"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_act_song_pieces",
                table: "act_song",
                sql: "jsonb_typeof(pieces) = 'array'"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DELETE FROM act_final_track_alignment AS later
                USING act_final_track_alignment AS earlier
                WHERE earlier.final_track_id = later.final_track_id
                  AND earlier.source_media_item_id = later.source_media_item_id
                  AND earlier.from_seconds < later.from_seconds;

                DELETE FROM act_video AS later
                USING act_video AS earlier
                WHERE earlier.media_item_id = later.media_item_id
                  AND earlier.id < later.id;
                """
            );

            migrationBuilder.DropIndex(name: "ix_act_video_media_item_id", table: "act_video");

            migrationBuilder.DropCheckConstraint(name: "ck_act_video_clip", table: "act_video");

            migrationBuilder.DropCheckConstraint(name: "ck_act_song_pieces", table: "act_song");

            migrationBuilder.DropPrimaryKey(
                name: "pk_act_final_track_alignment",
                table: "act_final_track_alignment"
            );

            migrationBuilder.DropColumn(name: "clip_end_seconds", table: "act_video");

            migrationBuilder.DropColumn(name: "clip_start_seconds", table: "act_video");

            migrationBuilder.DropColumn(name: "from_seconds", table: "act_final_track_alignment");

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

            migrationBuilder.Sql(
                """
                UPDATE act_song
                SET start_seconds = (pieces -> 0 ->> 'startSeconds')::double precision,
                    end_seconds = (pieces -> -1 ->> 'endSeconds')::double precision
                WHERE jsonb_array_length(pieces) > 0;
                """
            );

            migrationBuilder.DropColumn(name: "pieces", table: "act_song");

            migrationBuilder.AddPrimaryKey(
                name: "pk_act_final_track_alignment",
                table: "act_final_track_alignment",
                columns: new[] { "final_track_id", "source_media_item_id" }
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_video_media_item_id",
                table: "act_video",
                column: "media_item_id",
                unique: true
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_act_song_cut",
                table: "act_song",
                sql: "start_seconds >= 0 AND (end_seconds IS NULL OR end_seconds > start_seconds)"
            );
        }
    }
}
