using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MediaFileTombstones : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "media_file_tombstone",
                columns: table => new
                {
                    storage_key = table.Column<Guid>(type: "uuid", nullable: false),
                    buried_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false,
                        defaultValueSql: "now()"
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_media_file_tombstone", x => x.storage_key);
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_media_file_tombstone_buried_at",
                table: "media_file_tombstone",
                column: "buried_at"
            );

            migrationBuilder.Sql(
                """
                CREATE FUNCTION bury_media_files() RETURNS trigger LANGUAGE plpgsql AS $$
                BEGIN
                    INSERT INTO media_file_tombstone (storage_key)
                    VALUES (OLD.storage_key)
                    ON CONFLICT (storage_key) DO NOTHING;
                    RETURN NULL;
                END;
                $$;

                CREATE TRIGGER tr_media_item_bury_files
                AFTER DELETE ON media_item
                FOR EACH ROW EXECUTE FUNCTION bury_media_files();
                """
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DROP TRIGGER tr_media_item_bury_files ON media_item;
                DROP FUNCTION bury_media_files();
                """
            );

            migrationBuilder.DropTable(name: "media_file_tombstone");
        }
    }
}
