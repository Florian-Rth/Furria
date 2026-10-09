using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class GalleryAlbums : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "album_id",
                table: "media_item",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "binned_at",
                table: "media_item",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "caption",
                table: "media_item",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true
            );

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "placed_at",
                table: "media_item",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "selection_position",
                table: "media_item",
                type: "integer",
                nullable: true
            );

            migrationBuilder.CreateTable(
                name: "album",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    title = table.Column<string>(
                        type: "character varying(120)",
                        maxLength: 120,
                        nullable: false
                    ),
                    description = table.Column<string>(
                        type: "character varying(2000)",
                        maxLength: 2000,
                        nullable: true
                    ),
                    calendar_entry_id = table.Column<int>(type: "integer", nullable: true),
                    session_start_year = table.Column<int>(type: "integer", nullable: true),
                    cover_media_item_id = table.Column<int>(type: "integer", nullable: true),
                    published_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    binned_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    created_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false,
                        defaultValueSql: "now()"
                    ),
                    updated_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false,
                        defaultValueSql: "now()"
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_album", x => x.id);
                    table.CheckConstraint(
                        "ck_album_one_link",
                        "calendar_entry_id IS NULL OR session_start_year IS NULL"
                    );
                    table.CheckConstraint("ck_album_title", "length(btrim(title)) > 0");
                    table.ForeignKey(
                        name: "fk_album_calendar_entry_calendar_entry_id",
                        column: x => x.calendar_entry_id,
                        principalTable: "calendar_entry",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                    table.ForeignKey(
                        name: "fk_album_media_item_cover_media_item_id",
                        column: x => x.cover_media_item_id,
                        principalTable: "media_item",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_media_item_album_id",
                table: "media_item",
                column: "album_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_media_item_placed_at",
                table: "media_item",
                column: "placed_at"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_album_owner",
                table: "media_item",
                sql: "album_id IS NULL OR owner_kind = 'Gallery'"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_binned",
                table: "media_item",
                sql: "binned_at IS NULL OR album_id IS NOT NULL"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_caption",
                table: "media_item",
                sql: "caption IS NULL OR selection_position IS NOT NULL"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_placed",
                table: "media_item",
                sql: "(album_id IS NULL) = (placed_at IS NULL)"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_media_item_selection",
                table: "media_item",
                sql: "selection_position IS NULL\nOR (selection_position > 0 AND album_id IS NOT NULL AND binned_at IS NULL AND kind = 'Photo')"
            );

            migrationBuilder.CreateIndex(
                name: "ix_album_calendar_entry_id",
                table: "album",
                column: "calendar_entry_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_album_cover_media_item_id",
                table: "album",
                column: "cover_media_item_id"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_media_item_album_album_id",
                table: "media_item",
                column: "album_id",
                principalTable: "album",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_media_item_album_album_id",
                table: "media_item"
            );

            migrationBuilder.DropTable(name: "album");

            migrationBuilder.DropIndex(name: "ix_media_item_album_id", table: "media_item");

            migrationBuilder.DropIndex(name: "ix_media_item_placed_at", table: "media_item");

            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_album_owner",
                table: "media_item"
            );

            migrationBuilder.DropCheckConstraint(name: "ck_media_item_binned", table: "media_item");

            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_caption",
                table: "media_item"
            );

            migrationBuilder.DropCheckConstraint(name: "ck_media_item_placed", table: "media_item");

            migrationBuilder.DropCheckConstraint(
                name: "ck_media_item_selection",
                table: "media_item"
            );

            migrationBuilder.DropColumn(name: "album_id", table: "media_item");

            migrationBuilder.DropColumn(name: "binned_at", table: "media_item");

            migrationBuilder.DropColumn(name: "caption", table: "media_item");

            migrationBuilder.DropColumn(name: "placed_at", table: "media_item");

            migrationBuilder.DropColumn(name: "selection_position", table: "media_item");
        }
    }
}
