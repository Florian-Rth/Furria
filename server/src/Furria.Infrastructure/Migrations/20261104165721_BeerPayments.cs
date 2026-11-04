using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class BeerPayments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "beer_payment",
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
                    crates = table.Column<int>(type: "integer", nullable: false),
                    amount_cents = table.Column<int>(type: "integer", nullable: false),
                    booked_by_person_id = table.Column<int>(type: "integer", nullable: true),
                    booked_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    undone_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    undone_by_person_id = table.Column<int>(type: "integer", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_beer_payment", x => x.id);
                    table.UniqueConstraint(
                        "ak_beer_payment_id_beer_pot_id",
                        x => new { x.id, x.beer_pot_id }
                    );
                    table.CheckConstraint(
                        "ck_beer_payment_amount",
                        "amount_cents >= crates AND amount_cents <= crates * 10000"
                    );
                    table.CheckConstraint("ck_beer_payment_crates", "crates > 0 AND crates <= 500");
                    table.CheckConstraint(
                        "ck_beer_payment_undone",
                        "(undone_at IS NULL AND undone_by_person_id IS NULL) OR (undone_at IS NOT NULL AND undone_at >= booked_at)"
                    );
                    table.ForeignKey(
                        name: "fk_beer_payment_beer_pot_beer_pot_id",
                        column: x => x.beer_pot_id,
                        principalTable: "beer_pot",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict
                    );
                    table.ForeignKey(
                        name: "fk_beer_payment_person_booked_by_person_id",
                        column: x => x.booked_by_person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                    table.ForeignKey(
                        name: "fk_beer_payment_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                    table.ForeignKey(
                        name: "fk_beer_payment_person_undone_by_person_id",
                        column: x => x.undone_by_person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                }
            );

            migrationBuilder
                .CreateIndex(
                    name: "ix_beer_crate_open",
                    table: "beer_crate",
                    columns: new[] { "person_id", "beer_pot_id", "booked_at", "id" },
                    filter: "undone_at IS NULL AND paid_by_payment_id IS NULL"
                )
                .Annotation("Npgsql:IndexInclude", new[] { "price_cents" });

            migrationBuilder.CreateIndex(
                name: "ix_beer_crate_paid_by_payment_id_beer_pot_id",
                table: "beer_crate",
                columns: new[] { "paid_by_payment_id", "beer_pot_id" }
            );

            migrationBuilder.CreateIndex(
                name: "ix_beer_payment_beer_pot_id_person_id_standing",
                table: "beer_payment",
                columns: new[] { "beer_pot_id", "person_id" },
                filter: "undone_at IS NULL"
            );

            migrationBuilder.CreateIndex(
                name: "ix_beer_payment_booked_by_person_id",
                table: "beer_payment",
                column: "booked_by_person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_beer_payment_person_id",
                table: "beer_payment",
                column: "person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_beer_payment_undone_by_person_id",
                table: "beer_payment",
                column: "undone_by_person_id"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_beer_crate_beer_payment_paid_by_payment_id_beer_pot_id",
                table: "beer_crate",
                columns: new[] { "paid_by_payment_id", "beer_pot_id" },
                principalTable: "beer_payment",
                principalColumns: new[] { "id", "beer_pot_id" },
                onDelete: ReferentialAction.Restrict
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_beer_crate_beer_payment_paid_by_payment_id_beer_pot_id",
                table: "beer_crate"
            );

            migrationBuilder.DropTable(name: "beer_payment");

            migrationBuilder.DropIndex(name: "ix_beer_crate_open", table: "beer_crate");

            migrationBuilder.DropIndex(
                name: "ix_beer_crate_paid_by_payment_id_beer_pot_id",
                table: "beer_crate"
            );
        }
    }
}
