using System;
using Furria.Infrastructure.Changes;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ClaimWindow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "claim_window",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    opened_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    closes_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    closed_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    opened_by_person_id = table.Column<int>(type: "integer", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_claim_window", x => x.id);
                    table.CheckConstraint(
                        "ck_claim_window_closed_after_opening",
                        "closed_at IS NULL OR closed_at >= opened_at"
                    );
                    table.CheckConstraint("ck_claim_window_end", "closes_at > opened_at");
                    table.ForeignKey(
                        name: "fk_claim_window_person_opened_by_person_id",
                        column: x => x.opened_by_person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_claim_window_opened_at",
                table: "claim_window",
                column: "opened_at"
            );

            migrationBuilder.CreateIndex(
                name: "ix_claim_window_opened_by_person_id",
                table: "claim_window",
                column: "opened_by_person_id"
            );

            migrationBuilder.NotifyChangesOf("claim_window");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "claim_window");
        }
    }
}
