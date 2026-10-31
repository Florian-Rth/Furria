using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ActStudioRowsFollowTheirMedia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_act_final_track_media_item_media_item_id",
                table: "act_final_track"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_act_final_track_alignment_media_item_source_media_item_id",
                table: "act_final_track_alignment"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_act_part_act_step_first_step_id",
                table: "act_part"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_act_song_media_item_media_item_id",
                table: "act_song"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_act_step_media_item_start_source_media_item_id",
                table: "act_step"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_act_video_media_item_media_item_id",
                table: "act_video"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_act_video_media_item_start_source_media_item_id",
                table: "act_video"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_act_final_track_media_item_media_item_id",
                table: "act_final_track",
                column: "media_item_id",
                principalTable: "media_item",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "fk_act_final_track_alignment_media_item_source_media_item_id",
                table: "act_final_track_alignment",
                column: "source_media_item_id",
                principalTable: "media_item",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "fk_act_part_act_step_first_step_id",
                table: "act_part",
                column: "first_step_id",
                principalTable: "act_step",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "fk_act_song_media_item_media_item_id",
                table: "act_song",
                column: "media_item_id",
                principalTable: "media_item",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "fk_act_step_media_item_start_source_media_item_id",
                table: "act_step",
                column: "start_source_media_item_id",
                principalTable: "media_item",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "fk_act_video_media_item_media_item_id",
                table: "act_video",
                column: "media_item_id",
                principalTable: "media_item",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "fk_act_video_media_item_start_source_media_item_id",
                table: "act_video",
                column: "start_source_media_item_id",
                principalTable: "media_item",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_act_final_track_media_item_media_item_id",
                table: "act_final_track"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_act_final_track_alignment_media_item_source_media_item_id",
                table: "act_final_track_alignment"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_act_part_act_step_first_step_id",
                table: "act_part"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_act_song_media_item_media_item_id",
                table: "act_song"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_act_step_media_item_start_source_media_item_id",
                table: "act_step"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_act_video_media_item_media_item_id",
                table: "act_video"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_act_video_media_item_start_source_media_item_id",
                table: "act_video"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_act_final_track_media_item_media_item_id",
                table: "act_final_track",
                column: "media_item_id",
                principalTable: "media_item",
                principalColumn: "id"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_act_final_track_alignment_media_item_source_media_item_id",
                table: "act_final_track_alignment",
                column: "source_media_item_id",
                principalTable: "media_item",
                principalColumn: "id"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_act_part_act_step_first_step_id",
                table: "act_part",
                column: "first_step_id",
                principalTable: "act_step",
                principalColumn: "id"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_act_song_media_item_media_item_id",
                table: "act_song",
                column: "media_item_id",
                principalTable: "media_item",
                principalColumn: "id"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_act_step_media_item_start_source_media_item_id",
                table: "act_step",
                column: "start_source_media_item_id",
                principalTable: "media_item",
                principalColumn: "id"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_act_video_media_item_media_item_id",
                table: "act_video",
                column: "media_item_id",
                principalTable: "media_item",
                principalColumn: "id"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_act_video_media_item_start_source_media_item_id",
                table: "act_video",
                column: "start_source_media_item_id",
                principalTable: "media_item",
                principalColumn: "id"
            );
        }
    }
}
