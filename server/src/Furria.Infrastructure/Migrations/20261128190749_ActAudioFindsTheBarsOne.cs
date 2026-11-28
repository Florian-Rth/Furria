using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ActAudioFindsTheBarsOne : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_audio_facts",
                table: "media_item"
            );

            migrationBuilder.AddColumn<int>(
                name: "audio_analysis_version",
                table: "media_item",
                type: "integer",
                nullable: true
            );

            migrationBuilder.Sql(
                """
                UPDATE media_item SET audio_analysis_version = 1
                WHERE audio_sample_rate IS NOT NULL;

                UPDATE act_song song
                SET
                    first_beat_seconds = CASE
                        WHEN abs(song.first_beat_seconds - item.audio_first_beat_seconds) < 1e-6 THEN NULL
                        ELSE song.first_beat_seconds
                    END,
                    tempo_bpm = CASE
                        WHEN abs(song.tempo_bpm - item.audio_tempo_bpm) < 1e-6 THEN NULL
                        ELSE song.tempo_bpm
                    END
                FROM media_item item
                WHERE item.id = song.media_item_id
                  AND (song.first_beat_seconds IS NOT NULL OR song.tempo_bpm IS NOT NULL);
                """
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_audio_facts",
                table: "media_item",
                sql: "(audio_sample_rate IS NULL AND audio_loudness_lufs IS NULL AND audio_true_peak_dbtp IS NULL AND audio_leading_silence_seconds IS NULL AND audio_first_beat_seconds IS NULL AND audio_tempo_bpm IS NULL AND audio_analysis_version IS NULL)\nOR (kind = 'Audio' AND audio_sample_rate > 0 AND audio_loudness_lufs IS NOT NULL AND audio_true_peak_dbtp IS NOT NULL AND audio_leading_silence_seconds >= 0 AND audio_analysis_version >= 1\n    AND (audio_first_beat_seconds IS NULL) = (audio_tempo_bpm IS NULL)\n    AND (audio_first_beat_seconds IS NULL OR audio_first_beat_seconds >= 0)\n    AND (audio_tempo_bpm IS NULL OR audio_tempo_bpm > 0))"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_audio_facts",
                table: "media_item"
            );

            migrationBuilder.DropColumn(name: "audio_analysis_version", table: "media_item");

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_audio_facts",
                table: "media_item",
                sql: "(audio_sample_rate IS NULL AND audio_loudness_lufs IS NULL AND audio_true_peak_dbtp IS NULL AND audio_leading_silence_seconds IS NULL AND audio_first_beat_seconds IS NULL AND audio_tempo_bpm IS NULL)\nOR (kind = 'Audio' AND audio_sample_rate > 0 AND audio_loudness_lufs IS NOT NULL AND audio_true_peak_dbtp IS NOT NULL AND audio_leading_silence_seconds >= 0\n    AND (audio_first_beat_seconds IS NULL) = (audio_tempo_bpm IS NULL)\n    AND (audio_first_beat_seconds IS NULL OR audio_first_beat_seconds >= 0)\n    AND (audio_tempo_bpm IS NULL OR audio_tempo_bpm > 0))"
            );
        }
    }
}
