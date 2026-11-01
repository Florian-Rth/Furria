using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UploadLinks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_owner",
                table: "media_item");

            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_owner_kind",
                table: "media_item");

            migrationBuilder.AddColumn<int>(
                name: "owner_upload_link_id",
                table: "media_item",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "uploader_name",
                table: "media_item",
                type: "character varying(60)",
                maxLength: 60,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "upload_link",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    title = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    token_seed = table.Column<string>(type: "character varying(22)", maxLength: 22, nullable: false),
                    token_hash = table.Column<string>(type: "character varying(43)", maxLength: 43, nullable: false),
                    created_by_person_id = table.Column<int>(type: "integer", nullable: true),
                    expires_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    revoked_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    upload_count = table.Column<int>(type: "integer", nullable: false),
                    uploaded_bytes = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_upload_link", x => x.id);
                    table.CheckConstraint("ck_upload_link_counts", "upload_count >= 0 AND uploaded_bytes >= 0");
                    table.CheckConstraint("ck_upload_link_expiry", "expires_at > created_at");
                    table.CheckConstraint("ck_upload_link_title", "length(btrim(title)) > 0");
                    table.ForeignKey(
                        name: "fk_upload_link_person_created_by_person_id",
                        column: x => x.created_by_person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "ix_media_item_owner_upload_link_id",
                table: "media_item",
                column: "owner_upload_link_id");

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_owner",
                table: "media_item",
                sql: "(owner_kind = 'Person' AND owner_person_id IS NOT NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL AND owner_upload_link_id IS NULL)\nOR (owner_kind = 'Group' AND owner_group_id IS NOT NULL AND owner_person_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL AND owner_upload_link_id IS NULL)\nOR (owner_kind = 'NewsPost' AND owner_news_post_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL AND owner_upload_link_id IS NULL)\nOR (owner_kind = 'Event' AND owner_event_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL AND owner_upload_link_id IS NULL)\nOR (owner_kind = 'Act' AND owner_act_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_session_id IS NULL AND owner_upload_link_id IS NULL)\nOR (owner_kind = 'Session' AND owner_session_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_upload_link_id IS NULL)\nOR (owner_kind IN ('Gallery', 'Website') AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL AND owner_upload_link_id IS NULL)\nOR (owner_kind = 'UploadLink' AND owner_upload_link_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL)");

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_owner_kind",
                table: "media_item",
                sql: "owner_kind IN ('Person', 'Group', 'Gallery', 'NewsPost', 'Website', 'Event', 'Act', 'Session', 'UploadLink')");

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_uploader_name",
                table: "media_item",
                sql: "uploader_name IS NULL OR (uploaded_by_person_id IS NULL AND length(btrim(uploader_name)) > 0)");

            migrationBuilder.CreateIndex(
                name: "ix_upload_link_created_at",
                table: "upload_link",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_upload_link_created_by_person_id",
                table: "upload_link",
                column: "created_by_person_id");

            migrationBuilder.CreateIndex(
                name: "ix_upload_link_token_hash",
                table: "upload_link",
                column: "token_hash",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "fk_media_item_upload_link_owner_upload_link_id",
                table: "media_item",
                column: "owner_upload_link_id",
                principalTable: "upload_link",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_media_item_upload_link_owner_upload_link_id",
                table: "media_item");

            migrationBuilder.DropTable(
                name: "upload_link");

            migrationBuilder.DropIndex(
                name: "ix_media_item_owner_upload_link_id",
                table: "media_item");

            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_owner",
                table: "media_item");

            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_owner_kind",
                table: "media_item");

            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_uploader_name",
                table: "media_item");

            migrationBuilder.DropColumn(
                name: "owner_upload_link_id",
                table: "media_item");

            migrationBuilder.DropColumn(
                name: "uploader_name",
                table: "media_item");

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_owner",
                table: "media_item",
                sql: "(owner_kind = 'Person' AND owner_person_id IS NOT NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL)\nOR (owner_kind = 'Group' AND owner_group_id IS NOT NULL AND owner_person_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL)\nOR (owner_kind = 'NewsPost' AND owner_news_post_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL)\nOR (owner_kind = 'Event' AND owner_event_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL)\nOR (owner_kind = 'Act' AND owner_act_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_session_id IS NULL)\nOR (owner_kind = 'Session' AND owner_session_id IS NOT NULL AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL)\nOR (owner_kind IN ('Gallery', 'Website') AND owner_person_id IS NULL AND owner_group_id IS NULL AND owner_news_post_id IS NULL AND owner_event_id IS NULL AND owner_act_id IS NULL AND owner_session_id IS NULL)");

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_owner_kind",
                table: "media_item",
                sql: "owner_kind IN ('Person', 'Group', 'Gallery', 'NewsPost', 'Website', 'Event', 'Act', 'Session')");
        }
    }
}
