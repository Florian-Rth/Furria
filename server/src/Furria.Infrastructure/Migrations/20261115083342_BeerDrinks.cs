using System;
using Furria.Infrastructure.Changes;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class BeerDrinks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "beer_drink",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    name = table.Column<string>(
                        type: "character varying(40)",
                        maxLength: 40,
                        nullable: false,
                        collation: "de-DE-x-icu"
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_beer_drink", x => x.id);
                    table.CheckConstraint("ck_beer_drink_name", "btrim(name) <> ''");
                }
            );

            migrationBuilder.Sql(
                "CREATE UNIQUE INDEX ix_beer_drink_name ON beer_drink (lower(name));"
            );

            migrationBuilder.CreateTable(
                name: "beer_pot_drink",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    beer_pot_id = table.Column<int>(type: "integer", nullable: false),
                    beer_drink_id = table.Column<int>(type: "integer", nullable: false),
                    crate_price_cents = table.Column<int>(type: "integer", nullable: false),
                    is_default = table.Column<bool>(type: "boolean", nullable: false),
                    retired_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    stock_warning_sent_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_beer_pot_drink", x => x.id);
                    table.UniqueConstraint(
                        "ak_beer_pot_drink_beer_pot_id_beer_drink_id",
                        x => new { x.beer_pot_id, x.beer_drink_id }
                    );
                    table.CheckConstraint(
                        "ck_beer_pot_drink_crate_price",
                        "crate_price_cents > 0 AND crate_price_cents <= 10000"
                    );
                    table.ForeignKey(
                        name: "fk_beer_pot_drink_beer_drink_beer_drink_id",
                        column: x => x.beer_drink_id,
                        principalTable: "beer_drink",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict
                    );
                    table.ForeignKey(
                        name: "fk_beer_pot_drink_beer_pot_beer_pot_id",
                        column: x => x.beer_pot_id,
                        principalTable: "beer_pot",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict
                    );
                }
            );

            migrationBuilder.NotifyChangesOf("beer_drink");
            migrationBuilder.NotifyChangesOf("beer_pot_drink");

            migrationBuilder.AddColumn<int>(
                name: "beer_drink_id",
                table: "beer_stock_movement",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "beer_drink_id",
                table: "beer_crate",
                type: "integer",
                nullable: true
            );

            migrationBuilder.Sql(
                """
                INSERT INTO beer_drink (name)
                SELECT 'Bier' WHERE EXISTS (SELECT 1 FROM beer_pot);

                INSERT INTO beer_pot_drink (beer_pot_id, beer_drink_id, crate_price_cents, is_default, stock_warning_sent_at)
                SELECT pot.id, drink.id, pot.crate_price_cents, TRUE, pot.stock_warning_sent_at
                FROM beer_pot pot
                CROSS JOIN beer_drink drink
                WHERE drink.name = 'Bier';

                UPDATE beer_crate
                SET beer_drink_id = (SELECT id FROM beer_drink WHERE name = 'Bier');

                UPDATE beer_stock_movement
                SET beer_drink_id = (SELECT id FROM beer_drink WHERE name = 'Bier');
                """
            );

            migrationBuilder.AlterColumn<int>(
                name: "beer_drink_id",
                table: "beer_stock_movement",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<int>(
                name: "beer_drink_id",
                table: "beer_crate",
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true
            );

            migrationBuilder.DropIndex(
                name: "ix_beer_stock_movement_beer_pot_id_kind_handover",
                table: "beer_stock_movement"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_beer_pot_crate_price",
                table: "beer_pot"
            );

            migrationBuilder.DropIndex(name: "ix_beer_crate_booked_at_taken", table: "beer_crate");

            migrationBuilder.DropColumn(name: "crate_price_cents", table: "beer_pot");

            migrationBuilder.DropColumn(name: "stock_warning_sent_at", table: "beer_pot");

            migrationBuilder
                .CreateIndex(
                    name: "ix_beer_stock_movement_beer_pot_id_beer_drink_id",
                    table: "beer_stock_movement",
                    columns: new[] { "beer_pot_id", "beer_drink_id" }
                )
                .Annotation("Npgsql:IndexInclude", new[] { "crates" });

            migrationBuilder.CreateIndex(
                name: "ix_beer_stock_movement_beer_pot_id_beer_drink_id_kind_handover",
                table: "beer_stock_movement",
                columns: new[] { "beer_pot_id", "beer_drink_id", "kind" },
                unique: true,
                filter: "kind IN ('HandoverCarry', 'HandedOver')"
            );

            migrationBuilder.CreateIndex(
                name: "ix_beer_crate_beer_pot_id_beer_drink_id",
                table: "beer_crate",
                columns: new[] { "beer_pot_id", "beer_drink_id" }
            );

            migrationBuilder.CreateIndex(
                name: "ix_beer_crate_booked_at_taken",
                table: "beer_crate",
                columns: new[] { "booked_at", "beer_drink_id" },
                filter: "undone_at IS NULL"
            );

            migrationBuilder.CreateIndex(
                name: "ix_beer_pot_drink_beer_drink_id",
                table: "beer_pot_drink",
                column: "beer_drink_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_beer_pot_drink_beer_pot_id_default",
                table: "beer_pot_drink",
                column: "beer_pot_id",
                unique: true,
                filter: "is_default"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_beer_crate_beer_pot_drink_beer_pot_id_beer_drink_id",
                table: "beer_crate",
                columns: new[] { "beer_pot_id", "beer_drink_id" },
                principalTable: "beer_pot_drink",
                principalColumns: new[] { "beer_pot_id", "beer_drink_id" },
                onDelete: ReferentialAction.Restrict
            );

            migrationBuilder.AddForeignKey(
                name: "fk_beer_stock_movement_beer_pot_drink_beer_pot_id_beer_drink_id",
                table: "beer_stock_movement",
                columns: new[] { "beer_pot_id", "beer_drink_id" },
                principalTable: "beer_pot_drink",
                principalColumns: new[] { "beer_pot_id", "beer_drink_id" },
                onDelete: ReferentialAction.Restrict
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_beer_crate_beer_pot_drink_beer_pot_id_beer_drink_id",
                table: "beer_crate"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_beer_stock_movement_beer_pot_drink_beer_pot_id_beer_drink_id",
                table: "beer_stock_movement"
            );

            migrationBuilder.AddColumn<int>(
                name: "crate_price_cents",
                table: "beer_pot",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "stock_warning_sent_at",
                table: "beer_pot",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.Sql(
                """
                UPDATE beer_pot pot
                SET crate_price_cents = listed.crate_price_cents,
                    stock_warning_sent_at = listed.stock_warning_sent_at
                FROM (
                    SELECT DISTINCT ON (beer_pot_id) beer_pot_id, crate_price_cents, stock_warning_sent_at
                    FROM beer_pot_drink
                    ORDER BY beer_pot_id, retired_at IS NOT NULL, id
                ) listed
                WHERE listed.beer_pot_id = pot.id;
                """
            );

            migrationBuilder.DropTable(name: "beer_pot_drink");

            migrationBuilder.DropTable(name: "beer_drink");

            migrationBuilder.DropIndex(
                name: "ix_beer_stock_movement_beer_pot_id_beer_drink_id",
                table: "beer_stock_movement"
            );

            migrationBuilder.DropIndex(
                name: "ix_beer_stock_movement_beer_pot_id_beer_drink_id_kind_handover",
                table: "beer_stock_movement"
            );

            migrationBuilder.DropIndex(
                name: "ix_beer_crate_beer_pot_id_beer_drink_id",
                table: "beer_crate"
            );

            migrationBuilder.DropIndex(name: "ix_beer_crate_booked_at_taken", table: "beer_crate");

            migrationBuilder.DropColumn(name: "beer_drink_id", table: "beer_stock_movement");

            migrationBuilder.DropColumn(name: "beer_drink_id", table: "beer_crate");

            migrationBuilder.CreateIndex(
                name: "ix_beer_stock_movement_beer_pot_id_kind_handover",
                table: "beer_stock_movement",
                columns: new[] { "beer_pot_id", "kind" },
                unique: true,
                filter: "kind IN ('HandoverCarry', 'HandedOver')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_beer_pot_crate_price",
                table: "beer_pot",
                sql: "crate_price_cents > 0 AND crate_price_cents <= 10000"
            );

            migrationBuilder.CreateIndex(
                name: "ix_beer_crate_booked_at_taken",
                table: "beer_crate",
                column: "booked_at",
                filter: "undone_at IS NULL"
            );
        }
    }
}
