using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EventPictures : Migration
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
                name: "ck_media_item_website_photo",
                table: "media_item"
            );

            migrationBuilder.AddColumn<int>(
                name: "owner_event_id",
                table: "media_item",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "picture_id",
                table: "event",
                type: "integer",
                nullable: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_media_item_owner_event_id",
                table: "media_item",
                column: "owner_event_id"
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

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_photo_only",
                table: "media_item",
                sql: "owner_kind NOT IN ('Website', 'Event') OR kind = 'Photo'"
            );

            migrationBuilder.CreateIndex(
                name: "ix_event_picture_id",
                table: "event",
                column: "picture_id",
                unique: true
            );

            migrationBuilder.AddForeignKey(
                name: "fk_event_media_item_picture_id",
                table: "event",
                column: "picture_id",
                principalTable: "media_item",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull
            );

            migrationBuilder.AddForeignKey(
                name: "fk_media_item_event_owner_event_id",
                table: "media_item",
                column: "owner_event_id",
                principalTable: "event",
                principalColumn: "calendar_entry_id",
                onDelete: ReferentialAction.Cascade
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(name: "fk_event_media_item_picture_id", table: "event");

            migrationBuilder.DropForeignKey(
                name: "fk_media_item_event_owner_event_id",
                table: "media_item"
            );

            migrationBuilder.DropIndex(name: "ix_media_item_owner_event_id", table: "media_item");

            migrationBuilder.DropCheckConstraint(name: "ck_media_item_owner", table: "media_item");

            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_owner_kind",
                table: "media_item"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_photo_only",
                table: "media_item"
            );

            migrationBuilder.DropIndex(name: "ix_event_picture_id", table: "event");

            migrationBuilder.DropColumn(name: "owner_event_id", table: "media_item");

            migrationBuilder.DropColumn(name: "picture_id", table: "event");

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_owner",
                table: "media_item",
                sql: "(owner_kind = 'Person' AND owner_person_id IS NOT NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL)\nOR (owner_kind = 'Group' AND owner_group_id IS NOT NULL AND owner_person_id IS NULL AND owner_news_post_id IS NULL)\nOR (owner_kind = 'NewsPost' AND owner_news_post_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL)\nOR (owner_kind IN ('Gallery', 'Website') AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL)"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_owner_kind",
                table: "media_item",
                sql: "owner_kind IN ('Person', 'Group', 'Gallery', 'NewsPost', 'Website')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_website_photo",
                table: "media_item",
                sql: "owner_kind <> 'Website' OR kind = 'Photo'"
            );
        }
    }
}
