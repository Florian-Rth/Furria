using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class LiveDirection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "live_direction",
                columns: table => new
                {
                    calendar_entry_id = table.Column<int>(type: "integer", nullable: false),
                    appearance_id = table.Column<int>(type: "integer", nullable: true),
                    started_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    moved_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_live_direction", x => x.calendar_entry_id);
                    table.ForeignKey(
                        name: "fk_live_direction_appearance_appearance_id",
                        column: x => x.appearance_id,
                        principalTable: "appearance",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                    table.ForeignKey(
                        name: "fk_live_direction_running_order_calendar_entry_id",
                        column: x => x.calendar_entry_id,
                        principalTable: "running_order",
                        principalColumn: "calendar_entry_id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_live_direction_appearance_id",
                table: "live_direction",
                column: "appearance_id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "live_direction");
        }
    }
}
