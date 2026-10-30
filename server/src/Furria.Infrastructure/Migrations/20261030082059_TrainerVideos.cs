using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class TrainerVideos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(name: "ck_act_video_start", table: "act_video");

            migrationBuilder.DropColumn(name: "outdated_at", table: "act_video");

            migrationBuilder.AddColumn<double>(
                name: "start_video_seconds",
                table: "act_video",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_act_video_start",
                table: "act_video",
                sql: "(start_source_media_item_id IS NULL) = (start_seconds IS NULL) AND (start_seconds IS NULL OR start_seconds >= 0) AND start_video_seconds >= 0"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(name: "ck_act_video_start", table: "act_video");

            migrationBuilder.DropColumn(name: "start_video_seconds", table: "act_video");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "outdated_at",
                table: "act_video",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_act_video_start",
                table: "act_video",
                sql: "(start_source_media_item_id IS NULL) = (start_seconds IS NULL) AND (start_seconds IS NULL OR start_seconds >= 0)"
            );
        }
    }
}
