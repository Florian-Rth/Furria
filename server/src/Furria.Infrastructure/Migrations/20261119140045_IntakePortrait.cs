using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class IntakePortrait : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(name: "ck_media_item_owner", table: "media_item");

            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_owner_kind",
                table: "media_item"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_photo_only",
                table: "media_item"
            );

            migrationBuilder.AddColumn<int>(
                name: "owner_intake_id",
                table: "media_item",
                type: "integer",
                nullable: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_media_item_owner_intake_id",
                table: "media_item",
                column: "owner_intake_id",
                filter: "owner_intake_id IS NOT NULL"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_owner",
                table: "media_item",
                sql: "(owner_kind = 'Person' AND owner_person_id IS NOT NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL AND owner_upload_link_id IS NULL AND owner_intake_id IS NULL)\nOR (owner_kind = 'Group' AND owner_group_id IS NOT NULL AND owner_person_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL AND owner_upload_link_id IS NULL AND owner_intake_id IS NULL)\nOR (owner_kind = 'NewsPost' AND owner_news_post_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL AND owner_upload_link_id IS NULL AND owner_intake_id IS NULL)\nOR (owner_kind = 'Event' AND owner_event_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL AND owner_upload_link_id IS NULL AND owner_intake_id IS NULL)\nOR (owner_kind = 'Act' AND owner_act_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_session_id IS NULL AND owner_upload_link_id IS NULL AND owner_intake_id IS NULL)\nOR (owner_kind = 'Session' AND owner_session_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_upload_link_id IS NULL AND owner_intake_id IS NULL)\nOR (owner_kind IN ('Gallery', 'Website') AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL AND owner_upload_link_id IS NULL AND owner_intake_id IS NULL)\nOR (owner_kind = 'UploadLink' AND owner_upload_link_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL AND owner_intake_id IS NULL)\nOR (owner_kind = 'Intake' AND owner_intake_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL AND owner_upload_link_id IS NULL)"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_owner_kind",
                table: "media_item",
                sql: "owner_kind IN ('Person', 'Group', 'Gallery', 'NewsPost', 'Website', 'Event', 'Act', 'Session', 'UploadLink', 'Intake')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_photo_only",
                table: "media_item",
                sql: "owner_kind NOT IN ('Website', 'Event', 'Session', 'Intake') OR kind = 'Photo'"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_media_item_intake_owner_intake_id",
                table: "media_item",
                column: "owner_intake_id",
                principalTable: "intake",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_media_item_intake_owner_intake_id",
                table: "media_item"
            );

            migrationBuilder.DropIndex(name: "ix_media_item_owner_intake_id", table: "media_item");

            migrationBuilder.DropCheckConstraint(name: "ck_media_item_owner", table: "media_item");

            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_owner_kind",
                table: "media_item"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_photo_only",
                table: "media_item"
            );

            migrationBuilder.DropColumn(name: "owner_intake_id", table: "media_item");

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_owner",
                table: "media_item",
                sql: "(owner_kind = 'Person' AND owner_person_id IS NOT NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL AND owner_upload_link_id IS NULL)\nOR (owner_kind = 'Group' AND owner_group_id IS NOT NULL AND owner_person_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL AND owner_upload_link_id IS NULL)\nOR (owner_kind = 'NewsPost' AND owner_news_post_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL AND owner_upload_link_id IS NULL)\nOR (owner_kind = 'Event' AND owner_event_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL AND owner_upload_link_id IS NULL)\nOR (owner_kind = 'Act' AND owner_act_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_session_id IS NULL AND owner_upload_link_id IS NULL)\nOR (owner_kind = 'Session' AND owner_session_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_upload_link_id IS NULL)\nOR (owner_kind IN ('Gallery', 'Website') AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL AND owner_upload_link_id IS NULL)\nOR (owner_kind = 'UploadLink' AND owner_upload_link_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL)"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_owner_kind",
                table: "media_item",
                sql: "owner_kind IN ('Person', 'Group', 'Gallery', 'NewsPost', 'Website', 'Event', 'Act', 'Session', 'UploadLink')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_photo_only",
                table: "media_item",
                sql: "owner_kind NOT IN ('Website', 'Event', 'Session') OR kind = 'Photo'"
            );
        }
    }
}
