using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SessionLogoPicture : Migration
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

            migrationBuilder.DropColumn(name: "logo_svg", table: "session");

            migrationBuilder.AddColumn<int>(
                name: "logo_id",
                table: "session",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "owner_session_id",
                table: "media_item",
                type: "integer",
                nullable: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_session_logo_id",
                table: "session",
                column: "logo_id",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_media_item_owner_session_id",
                table: "media_item",
                column: "owner_session_id"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_owner",
                table: "media_item",
                sql: "(owner_kind = 'Person' AND owner_person_id IS NOT NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL)\nOR (owner_kind = 'Group' AND owner_group_id IS NOT NULL AND owner_person_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL)\nOR (owner_kind = 'NewsPost' AND owner_news_post_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL)\nOR (owner_kind = 'Event' AND owner_event_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL)\nOR (owner_kind = 'Act' AND owner_act_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_session_id IS NULL)\nOR (owner_kind = 'Session' AND owner_session_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL)\nOR (owner_kind IN ('Gallery', 'Website') AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL)"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_owner_kind",
                table: "media_item",
                sql: "owner_kind IN ('Person', 'Group', 'Gallery', 'NewsPost', 'Website', 'Event', 'Act', 'Session')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_photo_only",
                table: "media_item",
                sql: "owner_kind NOT IN ('Website', 'Event', 'Session') OR kind = 'Photo'"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_media_item_session_owner_session_id",
                table: "media_item",
                column: "owner_session_id",
                principalTable: "session",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "fk_session_media_item_logo_id",
                table: "session",
                column: "logo_id",
                principalTable: "media_item",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_media_item_session_owner_session_id",
                table: "media_item"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_session_media_item_logo_id",
                table: "session"
            );

            migrationBuilder.DropIndex(name: "ix_session_logo_id", table: "session");

            migrationBuilder.DropIndex(name: "ix_media_item_owner_session_id", table: "media_item");

            migrationBuilder.DropCheckConstraint(name: "ck_media_item_owner", table: "media_item");

            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_owner_kind",
                table: "media_item"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_photo_only",
                table: "media_item"
            );

            migrationBuilder.DropColumn(name: "logo_id", table: "session");

            migrationBuilder.DropColumn(name: "owner_session_id", table: "media_item");

            migrationBuilder.AddColumn<string>(
                name: "logo_svg",
                table: "session",
                type: "character varying(200000)",
                maxLength: 200000,
                nullable: true
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

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_photo_only",
                table: "media_item",
                sql: "owner_kind NOT IN ('Website', 'Event') OR kind = 'Photo'"
            );
        }
    }
}
