using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EventPresalePlaces : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "event_presale_place",
                columns: table => new
                {
                    event_id = table.Column<int>(type: "integer", nullable: false),
                    venue_id = table.Column<int>(type: "integer", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_event_presale_place", x => new { x.event_id, x.venue_id });
                    table.CheckConstraint("ck_event_presale_place_sort_order", "sort_order >= 0");
                    table.ForeignKey(
                        name: "fk_event_presale_place_event_event_id",
                        column: x => x.event_id,
                        principalTable: "event",
                        principalColumn: "calendar_entry_id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_event_presale_place_venue_venue_id",
                        column: x => x.venue_id,
                        principalTable: "venue",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_event_presale_place_venue_id",
                table: "event_presale_place",
                column: "venue_id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "event_presale_place");
        }
    }
}
