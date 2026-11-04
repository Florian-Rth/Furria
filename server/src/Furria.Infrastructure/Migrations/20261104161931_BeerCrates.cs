using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class BeerCrates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "beer_crate",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    beer_pot_id = table.Column<int>(type: "integer", nullable: false),
                    person_id = table.Column<int>(type: "integer", nullable: true),
                    price_cents = table.Column<int>(type: "integer", nullable: false),
                    entered_by_person_id = table.Column<int>(type: "integer", nullable: true),
                    booked_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    undone_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    undone_by_person_id = table.Column<int>(type: "integer", nullable: true),
                    paid_by_payment_id = table.Column<int>(type: "integer", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_beer_crate", x => x.id);
                    table.CheckConstraint(
                        "ck_beer_crate_price",
                        "price_cents > 0 AND price_cents <= 10000"
                    );
                    table.CheckConstraint(
                        "ck_beer_crate_undone",
                        "(undone_at IS NULL AND undone_by_person_id IS NULL) OR (undone_at IS NOT NULL AND undone_at >= booked_at AND paid_by_payment_id IS NULL)"
                    );
                    table.ForeignKey(
                        name: "fk_beer_crate_beer_pot_beer_pot_id",
                        column: x => x.beer_pot_id,
                        principalTable: "beer_pot",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict
                    );
                    table.ForeignKey(
                        name: "fk_beer_crate_person_entered_by_person_id",
                        column: x => x.entered_by_person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                    table.ForeignKey(
                        name: "fk_beer_crate_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                    table.ForeignKey(
                        name: "fk_beer_crate_person_undone_by_person_id",
                        column: x => x.undone_by_person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_beer_crate_beer_pot_id_person_id_taken",
                table: "beer_crate",
                columns: new[] { "beer_pot_id", "person_id" },
                filter: "undone_at IS NULL"
            );

            migrationBuilder.CreateIndex(
                name: "ix_beer_crate_booked_at_taken",
                table: "beer_crate",
                column: "booked_at",
                filter: "undone_at IS NULL"
            );

            migrationBuilder.CreateIndex(
                name: "ix_beer_crate_entered_by_person_id",
                table: "beer_crate",
                column: "entered_by_person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_beer_crate_person_id",
                table: "beer_crate",
                column: "person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_beer_crate_undone_by_person_id",
                table: "beer_crate",
                column: "undone_by_person_id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "beer_crate");
        }
    }
}
