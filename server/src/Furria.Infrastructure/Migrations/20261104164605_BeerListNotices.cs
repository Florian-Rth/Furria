using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class BeerListNotices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "stock_warning_sent_at",
                table: "beer_pot",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.CreateTable(
                name: "beer_tab_reminder",
                columns: table => new
                {
                    person_id = table.Column<int>(type: "integer", nullable: false),
                    sent_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_beer_tab_reminder", x => x.person_id);
                    table.ForeignKey(
                        name: "fk_beer_tab_reminder_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "beer_tab_reminder");

            migrationBuilder.DropColumn(name: "stock_warning_sent_at", table: "beer_pot");
        }
    }
}
