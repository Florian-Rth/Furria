using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class BeerPotHandover : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_beer_stock_movement_beer_pot_id_carry",
                table: "beer_stock_movement"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_beer_stock_movement_crates",
                table: "beer_stock_movement"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_beer_stock_movement_kind",
                table: "beer_stock_movement"
            );

            migrationBuilder.CreateIndex(
                name: "ix_beer_stock_movement_beer_pot_id_kind_handover",
                table: "beer_stock_movement",
                columns: new[] { "beer_pot_id", "kind" },
                unique: true,
                filter: "kind IN ('HandoverCarry', 'HandedOver')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_beer_stock_movement_crates",
                table: "beer_stock_movement",
                sql: "crates <> 0 AND (kind IN ('HandoverCarry', 'HandedOver') OR abs(crates) <= 500)"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_beer_stock_movement_kind",
                table: "beer_stock_movement",
                sql: "(kind IN ('Delivery', 'HandoverCarry') AND reason IS NULL AND crates > 0) OR (kind = 'HandedOver' AND reason IS NULL AND crates < 0) OR (kind = 'Correction' AND reason IS NOT NULL AND (reason = 'Miscount' OR (reason IN ('Shrinkage', 'Breakage') AND crates < 0)))"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_beer_stock_movement_beer_pot_id_kind_handover",
                table: "beer_stock_movement"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_beer_stock_movement_crates",
                table: "beer_stock_movement"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_beer_stock_movement_kind",
                table: "beer_stock_movement"
            );

            migrationBuilder.CreateIndex(
                name: "ix_beer_stock_movement_beer_pot_id_carry",
                table: "beer_stock_movement",
                column: "beer_pot_id",
                unique: true,
                filter: "kind = 'HandoverCarry'"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_beer_stock_movement_crates",
                table: "beer_stock_movement",
                sql: "crates <> 0 AND abs(crates) <= 500"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_beer_stock_movement_kind",
                table: "beer_stock_movement",
                sql: "(kind IN ('Delivery', 'HandoverCarry') AND reason IS NULL AND crates > 0) OR (kind = 'Correction' AND reason IS NOT NULL AND (reason = 'Miscount' OR (reason IN ('Shrinkage', 'Breakage') AND crates < 0)))"
            );
        }
    }
}
