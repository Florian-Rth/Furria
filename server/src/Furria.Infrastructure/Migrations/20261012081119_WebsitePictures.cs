using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class WebsitePictures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(name: "ck_media_item_owner", table: "media_item");

            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_owner_kind",
                table: "media_item"
            );

            migrationBuilder.CreateTable(
                name: "website_picture",
                columns: table => new
                {
                    slot_key = table.Column<string>(
                        type: "character varying(80)",
                        maxLength: 80,
                        nullable: false
                    ),
                    position = table.Column<int>(type: "integer", nullable: false),
                    media_item_id = table.Column<int>(type: "integer", nullable: false),
                    aspect = table.Column<double>(type: "double precision", nullable: false),
                    alt = table.Column<string>(
                        type: "character varying(300)",
                        maxLength: 300,
                        nullable: true
                    ),
                    updated_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    updated_by_person_id = table.Column<int>(type: "integer", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_website_picture", x => new { x.slot_key, x.position });
                    table.CheckConstraint("ck_website_picture_aspect", "aspect BETWEEN 0.25 AND 4");
                    table.CheckConstraint(
                        "ck_website_picture_position",
                        "position BETWEEN 1 AND 24"
                    );
                    table.CheckConstraint(
                        "ck_website_picture_slot_key",
                        "slot_key ~ '^[a-z][a-zA-Z]*(\\.[a-z][a-zA-Z]*)+$'"
                    );
                    table.ForeignKey(
                        name: "fk_website_picture_media_item_media_item_id",
                        column: x => x.media_item_id,
                        principalTable: "media_item",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_website_picture_person_updated_by_person_id",
                        column: x => x.updated_by_person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                }
            );

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

            migrationBuilder.CreateIndex(
                name: "ix_website_picture_media_item_id",
                table: "website_picture",
                column: "media_item_id",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_website_picture_updated_by_person_id",
                table: "website_picture",
                column: "updated_by_person_id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "website_picture");

            migrationBuilder.DropCheckConstraint(name: "ck_media_item_owner", table: "media_item");

            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_owner_kind",
                table: "media_item"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_website_photo",
                table: "media_item"
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
        }
    }
}
