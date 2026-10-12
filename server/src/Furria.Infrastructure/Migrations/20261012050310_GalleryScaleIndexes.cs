using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class GalleryScaleIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "ix_media_item_album_selection",
                table: "media_item",
                columns: new[] { "album_id", "selection_position" },
                filter: "selection_position IS NOT NULL"
            );

            migrationBuilder.Sql(
                "CREATE INDEX ix_media_item_album_capture_order ON media_item (album_id, coalesce(captured_at, uploaded_at), id) WHERE binned_at IS NULL;"
            );

            migrationBuilder.Sql(
                "CREATE INDEX ix_media_item_inbox_capture_order ON media_item (uploaded_by_person_id, coalesce(captured_at, uploaded_at), id) WHERE owner_kind = 'Gallery' AND album_id IS NULL;"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP INDEX ix_media_item_inbox_capture_order;");

            migrationBuilder.Sql("DROP INDEX ix_media_item_album_capture_order;");

            migrationBuilder.DropIndex(name: "ix_media_item_album_selection", table: "media_item");
        }
    }
}
