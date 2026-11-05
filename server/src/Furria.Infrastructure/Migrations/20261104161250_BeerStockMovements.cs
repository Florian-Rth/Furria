using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class BeerStockMovements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "beer_stock_movement",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    beer_pot_id = table.Column<int>(type: "integer", nullable: false),
                    kind = table.Column<string>(
                        type: "character varying(16)",
                        maxLength: 16,
                        nullable: false
                    ),
                    crates = table.Column<int>(type: "integer", nullable: false),
                    reason = table.Column<string>(
                        type: "character varying(16)",
                        maxLength: 16,
                        nullable: true
                    ),
                    booked_by_person_id = table.Column<int>(type: "integer", nullable: true),
                    booked_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_beer_stock_movement", x => x.id);
                    table.CheckConstraint(
                        "ck_beer_stock_movement_crates",
                        "crates <> 0 AND abs(crates) <= 500"
                    );
                    table.CheckConstraint(
                        "ck_beer_stock_movement_kind",
                        "(kind IN ('Delivery', 'HandoverCarry') AND reason IS NULL AND crates > 0) OR (kind = 'Correction' AND reason IS NOT NULL AND (reason = 'Miscount' OR (reason IN ('Shrinkage', 'Breakage') AND crates < 0)))"
                    );
                    table.ForeignKey(
                        name: "fk_beer_stock_movement_beer_pot_beer_pot_id",
                        column: x => x.beer_pot_id,
                        principalTable: "beer_pot",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict
                    );
                    table.ForeignKey(
                        name: "fk_beer_stock_movement_person_booked_by_person_id",
                        column: x => x.booked_by_person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                }
            );

            migrationBuilder
                .CreateIndex(
                    name: "ix_beer_stock_movement_beer_pot_id_booked_at",
                    table: "beer_stock_movement",
                    columns: new[] { "beer_pot_id", "booked_at" }
                )
                .Annotation("Npgsql:IndexInclude", new[] { "crates" });

            migrationBuilder.CreateIndex(
                name: "ix_beer_stock_movement_beer_pot_id_carry",
                table: "beer_stock_movement",
                column: "beer_pot_id",
                unique: true,
                filter: "kind = 'HandoverCarry'"
            );

            migrationBuilder.CreateIndex(
                name: "ix_beer_stock_movement_booked_by_person_id",
                table: "beer_stock_movement",
                column: "booked_by_person_id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "beer_stock_movement");
        }
    }
}
