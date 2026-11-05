using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class BeerPotAndEnrollment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "beer_list_enrollment",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    person_id = table.Column<int>(type: "integer", nullable: false),
                    started_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    ended_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    ended_by_person_id = table.Column<int>(type: "integer", nullable: true),
                    created_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false,
                        defaultValueSql: "now()"
                    ),
                    updated_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false,
                        defaultValueSql: "now()"
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_beer_list_enrollment", x => x.id);
                    table.CheckConstraint(
                        "ck_beer_list_enrollment_ended_by",
                        "ended_by_person_id IS NULL OR ended_at IS NOT NULL"
                    );
                    table.CheckConstraint(
                        "ck_beer_list_enrollment_period",
                        "ended_at IS NULL OR ended_at >= started_at"
                    );
                    table.ForeignKey(
                        name: "fk_beer_list_enrollment_person_ended_by_person_id",
                        column: x => x.ended_by_person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                    table.ForeignKey(
                        name: "fk_beer_list_enrollment_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "beer_pot",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    owner_person_id = table.Column<int>(type: "integer", nullable: true),
                    crate_price_cents = table.Column<int>(type: "integer", nullable: false),
                    payment_link = table.Column<string>(
                        type: "character varying(200)",
                        maxLength: 200,
                        nullable: true
                    ),
                    payment_note = table.Column<string>(
                        type: "character varying(500)",
                        maxLength: 500,
                        nullable: true
                    ),
                    opened_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    closed_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    created_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false,
                        defaultValueSql: "now()"
                    ),
                    updated_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false,
                        defaultValueSql: "now()"
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_beer_pot", x => x.id);
                    table.CheckConstraint(
                        "ck_beer_pot_crate_price",
                        "crate_price_cents > 0 AND crate_price_cents <= 10000"
                    );
                    table.CheckConstraint(
                        "ck_beer_pot_payment_details",
                        "btrim(coalesce(payment_link, '')) <> '' OR btrim(coalesce(payment_note, '')) <> ''"
                    );
                    table.CheckConstraint(
                        "ck_beer_pot_period",
                        "closed_at IS NULL OR closed_at >= opened_at"
                    );
                    table.ForeignKey(
                        name: "fk_beer_pot_person_owner_person_id",
                        column: x => x.owner_person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_beer_list_enrollment_ended_by_person_id",
                table: "beer_list_enrollment",
                column: "ended_by_person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_beer_list_enrollment_person_id",
                table: "beer_list_enrollment",
                column: "person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_beer_list_enrollment_person_id_running",
                table: "beer_list_enrollment",
                column: "person_id",
                unique: true,
                filter: "ended_at IS NULL"
            );

            migrationBuilder
                .CreateIndex(
                    name: "ix_beer_pot_open",
                    table: "beer_pot",
                    column: "closed_at",
                    unique: true,
                    filter: "closed_at IS NULL"
                )
                .Annotation("Npgsql:NullsDistinct", false);

            migrationBuilder.CreateIndex(
                name: "ix_beer_pot_owner_person_id",
                table: "beer_pot",
                column: "owner_person_id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "beer_list_enrollment");

            migrationBuilder.DropTable(name: "beer_pot");
        }
    }
}
