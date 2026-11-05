using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class BeerListCashAndPlainCorrections : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_beer_stock_movement_kind",
                table: "beer_stock_movement"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_beer_pot_payment_details",
                table: "beer_pot"
            );

            migrationBuilder.DropColumn(name: "reason", table: "beer_stock_movement");

            migrationBuilder.DropColumn(name: "payment_note", table: "beer_pot");

            migrationBuilder.AddCheckConstraint(
                name: "ck_beer_stock_movement_kind",
                table: "beer_stock_movement",
                sql: "(kind IN ('Delivery', 'HandoverCarry') AND crates > 0) OR (kind = 'HandedOver' AND crates < 0) OR kind = 'Correction'"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_beer_stock_movement_kind",
                table: "beer_stock_movement"
            );

            migrationBuilder.AddColumn<string>(
                name: "reason",
                table: "beer_stock_movement",
                type: "character varying(16)",
                maxLength: 16,
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "payment_note",
                table: "beer_pot",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_beer_stock_movement_kind",
                table: "beer_stock_movement",
                sql: "(kind IN ('Delivery', 'HandoverCarry') AND reason IS NULL AND crates > 0) OR (kind = 'HandedOver' AND reason IS NULL AND crates < 0) OR (kind = 'Correction' AND reason IS NOT NULL AND (reason = 'Miscount' OR (reason IN ('Shrinkage', 'Breakage') AND crates < 0)))"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_beer_pot_payment_details",
                table: "beer_pot",
                sql: "btrim(coalesce(payment_link, '')) <> '' OR btrim(coalesce(payment_note, '')) <> ''"
            );
        }
    }
}
