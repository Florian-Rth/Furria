using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ActSession : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "cast_frozen_at",
                table: "act",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "follows_act_id",
                table: "act",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "session_year",
                table: "act",
                type: "integer",
                nullable: true
            );

            migrationBuilder.Sql(
                "UPDATE act SET session_year = 2026 WHERE kind IS NOT NULL AND kind <> 'Point';"
            );

            migrationBuilder.CreateTable(
                name: "act_frozen_cast_member",
                columns: table => new
                {
                    act_id = table.Column<int>(type: "integer", nullable: false),
                    person_id = table.Column<int>(type: "integer", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey(
                        "pk_act_frozen_cast_member",
                        x => new { x.act_id, x.person_id }
                    );
                    table.ForeignKey(
                        name: "fk_act_frozen_cast_member_act_act_id",
                        column: x => x.act_id,
                        principalTable: "act",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_act_frozen_cast_member_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_follows_act_id",
                table: "act",
                column: "follows_act_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_session_year",
                table: "act",
                column: "session_year"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_act_follows_other_act",
                table: "act",
                sql: "follows_act_id IS NULL OR follows_act_id <> id"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_act_frozen_cast_dated",
                table: "act",
                sql: "cast_frozen_at IS NULL OR session_year IS NOT NULL"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_act_session_year",
                table: "act",
                sql: "session_year IS NULL OR session_year >= 1971"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_act_timeless_kind",
                table: "act",
                sql: "session_year IS NULL OR (kind IS NOT NULL AND kind <> 'Point')"
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_frozen_cast_member_person_id",
                table: "act_frozen_cast_member",
                column: "person_id"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_act_act_follows_act_id",
                table: "act",
                column: "follows_act_id",
                principalTable: "act",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(name: "fk_act_act_follows_act_id", table: "act");

            migrationBuilder.DropTable(name: "act_frozen_cast_member");

            migrationBuilder.DropIndex(name: "ix_act_follows_act_id", table: "act");

            migrationBuilder.DropIndex(name: "ix_act_session_year", table: "act");

            migrationBuilder.DropCheckConstraint(name: "ck_act_follows_other_act", table: "act");

            migrationBuilder.DropCheckConstraint(name: "ck_act_frozen_cast_dated", table: "act");

            migrationBuilder.DropCheckConstraint(name: "ck_act_session_year", table: "act");

            migrationBuilder.DropCheckConstraint(name: "ck_act_timeless_kind", table: "act");

            migrationBuilder.DropColumn(name: "cast_frozen_at", table: "act");

            migrationBuilder.DropColumn(name: "follows_act_id", table: "act");

            migrationBuilder.DropColumn(name: "session_year", table: "act");
        }
    }
}
