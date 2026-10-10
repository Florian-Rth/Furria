using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class NewsPictures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(name: "ck_media_item_owner", table: "media_item");

            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_owner_kind",
                table: "media_item"
            );

            migrationBuilder.AddColumn<string>(
                name: "pending_picture_caption",
                table: "news_post",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "pending_picture_id",
                table: "news_post",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "picture_caption",
                table: "news_post",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "picture_id",
                table: "news_post",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "owner_news_post_id",
                table: "media_item",
                type: "integer",
                nullable: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_news_post_pending_picture_id",
                table: "news_post",
                column: "pending_picture_id",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_news_post_picture_id",
                table: "news_post",
                column: "picture_id",
                unique: true
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_news_post_pending_picture",
                table: "news_post",
                sql: "pending_saved_at IS NOT NULL OR (pending_picture_id IS NULL AND pending_picture_caption IS NULL)"
            );

            migrationBuilder.CreateIndex(
                name: "ix_media_item_owner_news_post_id",
                table: "media_item",
                column: "owner_news_post_id"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_owner",
                table: "media_item",
                sql: "(owner_kind = 'Person' AND owner_person_id IS NOT NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL)\nOR (owner_kind = 'Group' AND owner_group_id IS NOT NULL AND owner_person_id IS NULL AND owner_news_post_id IS NULL)\nOR (owner_kind = 'NewsPost' AND owner_news_post_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL)\nOR (owner_kind = 'Gallery' AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL)"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_owner_kind",
                table: "media_item",
                sql: "owner_kind IN ('Person', 'Group', 'Gallery', 'NewsPost')"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_media_item_news_post_owner_news_post_id",
                table: "media_item",
                column: "owner_news_post_id",
                principalTable: "news_post",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "fk_news_post_media_item_pending_picture_id",
                table: "news_post",
                column: "pending_picture_id",
                principalTable: "media_item",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull
            );

            migrationBuilder.AddForeignKey(
                name: "fk_news_post_media_item_picture_id",
                table: "news_post",
                column: "picture_id",
                principalTable: "media_item",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_media_item_news_post_owner_news_post_id",
                table: "media_item"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_news_post_media_item_pending_picture_id",
                table: "news_post"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_news_post_media_item_picture_id",
                table: "news_post"
            );

            migrationBuilder.DropIndex(name: "ix_news_post_pending_picture_id", table: "news_post");

            migrationBuilder.DropIndex(name: "ix_news_post_picture_id", table: "news_post");

            migrationBuilder.DropCheckConstraint(
                name: "ck_news_post_pending_picture",
                table: "news_post"
            );

            migrationBuilder.DropIndex(
                name: "ix_media_item_owner_news_post_id",
                table: "media_item"
            );

            migrationBuilder.DropCheckConstraint(name: "ck_media_item_owner", table: "media_item");

            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_owner_kind",
                table: "media_item"
            );

            migrationBuilder.DropColumn(name: "pending_picture_caption", table: "news_post");

            migrationBuilder.DropColumn(name: "pending_picture_id", table: "news_post");

            migrationBuilder.DropColumn(name: "picture_caption", table: "news_post");

            migrationBuilder.DropColumn(name: "picture_id", table: "news_post");

            migrationBuilder.DropColumn(name: "owner_news_post_id", table: "media_item");

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_owner",
                table: "media_item",
                sql: "(owner_kind = 'Person' AND owner_person_id IS NOT NULL AND owner_group_id IS NULL)\nOR (owner_kind = 'Group' AND owner_group_id IS NOT NULL AND owner_person_id IS NULL)\nOR (owner_kind = 'Gallery' AND owner_person_id IS NULL AND owner_group_id IS NULL)"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_owner_kind",
                table: "media_item",
                sql: "owner_kind IN ('Person', 'Group', 'Gallery')"
            );
        }
    }
}
