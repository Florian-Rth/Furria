using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ActAudioMedia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(name: "ck_media_item_kind", table: "media_item");

            migrationBuilder.DropCheckConstraint(name: "ck_media_item_owner", table: "media_item");

            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_owner_kind",
                table: "media_item"
            );

            migrationBuilder.AddColumn<int>(
                name: "audio_media_item_id",
                table: "media_worker_heartbeat",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<double>(
                name: "audio_first_beat_seconds",
                table: "media_item",
                type: "double precision",
                nullable: true
            );

            migrationBuilder.AddColumn<double>(
                name: "audio_leading_silence_seconds",
                table: "media_item",
                type: "double precision",
                nullable: true
            );

            migrationBuilder.AddColumn<double>(
                name: "audio_loudness_lufs",
                table: "media_item",
                type: "double precision",
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "audio_sample_rate",
                table: "media_item",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<double>(
                name: "audio_tempo_bpm",
                table: "media_item",
                type: "double precision",
                nullable: true
            );

            migrationBuilder.AddColumn<double>(
                name: "audio_true_peak_dbtp",
                table: "media_item",
                type: "double precision",
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "owner_act_id",
                table: "media_item",
                type: "integer",
                nullable: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_media_item_owner_act_id",
                table: "media_item",
                column: "owner_act_id"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_act_media",
                table: "media_item",
                sql: "owner_kind <> 'Act' OR kind IN ('Audio', 'Video')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_audio_facts",
                table: "media_item",
                sql: "(audio_sample_rate IS NULL AND audio_loudness_lufs IS NULL AND audio_true_peak_dbtp IS NULL AND audio_leading_silence_seconds IS NULL AND audio_first_beat_seconds IS NULL AND audio_tempo_bpm IS NULL)\nOR (kind = 'Audio' AND audio_sample_rate > 0 AND audio_loudness_lufs IS NOT NULL AND audio_true_peak_dbtp IS NOT NULL AND audio_leading_silence_seconds >= 0\n    AND (audio_first_beat_seconds IS NULL) = (audio_tempo_bpm IS NULL)\n    AND (audio_first_beat_seconds IS NULL OR audio_first_beat_seconds >= 0)\n    AND (audio_tempo_bpm IS NULL OR audio_tempo_bpm > 0))"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_audio_of_act",
                table: "media_item",
                sql: "kind <> 'Audio' OR owner_kind = 'Act'"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_kind",
                table: "media_item",
                sql: "kind IN ('Photo', 'Video', 'Audio')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_owner",
                table: "media_item",
                sql: "(owner_kind = 'Person' AND owner_person_id IS NOT NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL)\nOR (owner_kind = 'Group' AND owner_group_id IS NOT NULL AND owner_person_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL)\nOR (owner_kind = 'NewsPost' AND owner_news_post_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL)\nOR (owner_kind = 'Event' AND owner_event_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_act_id IS NULL)\nOR (owner_kind = 'Act' AND owner_act_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL)\nOR (owner_kind IN ('Gallery', 'Website') AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL)"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_owner_kind",
                table: "media_item",
                sql: "owner_kind IN ('Person', 'Group', 'Gallery', 'NewsPost', 'Website', 'Event', 'Act')"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_media_item_act_owner_act_id",
                table: "media_item",
                column: "owner_act_id",
                principalTable: "act",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "DELETE FROM media_item WHERE owner_kind = 'Act' OR kind = 'Audio';"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_media_item_act_owner_act_id",
                table: "media_item"
            );

            migrationBuilder.DropIndex(name: "ix_media_item_owner_act_id", table: "media_item");

            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_act_media",
                table: "media_item"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_audio_facts",
                table: "media_item"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_audio_of_act",
                table: "media_item"
            );

            migrationBuilder.DropCheckConstraint(name: "ck_media_item_kind", table: "media_item");

            migrationBuilder.DropCheckConstraint(name: "ck_media_item_owner", table: "media_item");

            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_owner_kind",
                table: "media_item"
            );

            migrationBuilder.DropColumn(
                name: "audio_media_item_id",
                table: "media_worker_heartbeat"
            );

            migrationBuilder.DropColumn(name: "audio_first_beat_seconds", table: "media_item");

            migrationBuilder.DropColumn(name: "audio_leading_silence_seconds", table: "media_item");

            migrationBuilder.DropColumn(name: "audio_loudness_lufs", table: "media_item");

            migrationBuilder.DropColumn(name: "audio_sample_rate", table: "media_item");

            migrationBuilder.DropColumn(name: "audio_tempo_bpm", table: "media_item");

            migrationBuilder.DropColumn(name: "audio_true_peak_dbtp", table: "media_item");

            migrationBuilder.DropColumn(name: "owner_act_id", table: "media_item");

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_kind",
                table: "media_item",
                sql: "kind IN ('Photo', 'Video')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_owner",
                table: "media_item",
                sql: "(owner_kind = 'Person' AND owner_person_id IS NOT NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL)\nOR (owner_kind = 'Group' AND owner_group_id IS NOT NULL AND owner_person_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL)\nOR (owner_kind = 'NewsPost' AND owner_news_post_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_event_id IS NULL)\nOR (owner_kind = 'Event' AND owner_event_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL)\nOR (owner_kind IN ('Gallery', 'Website') AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL)"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_owner_kind",
                table: "media_item",
                sql: "owner_kind IN ('Person', 'Group', 'Gallery', 'NewsPost', 'Website', 'Event')"
            );
        }
    }
}
