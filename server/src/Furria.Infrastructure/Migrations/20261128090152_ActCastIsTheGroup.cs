using Furria.Infrastructure.Changes;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ActCastIsTheGroup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                UPDATE spot AS s
                SET person_id = NULL
                FROM act AS a
                WHERE s.act_id = a.id
                  AND a.cast_frozen_at IS NULL
                  AND s.person_id IS NOT NULL
                  AND NOT EXISTS (
                      SELECT 1 FROM group_membership AS m
                      WHERE m.group_id = a.group_id
                        AND m.person_id = s.person_id
                        AND (m.left_on IS NULL OR m.left_on >= CURRENT_DATE));

                DELETE FROM act_co_editor AS e
                USING act AS a
                WHERE e.act_id = a.id
                  AND a.cast_frozen_at IS NULL
                  AND NOT EXISTS (
                      SELECT 1 FROM group_membership AS m
                      WHERE m.group_id = a.group_id
                        AND m.person_id = e.person_id
                        AND (m.left_on IS NULL OR m.left_on >= CURRENT_DATE));
                """
            );

            migrationBuilder.DropTable(name: "act_cast_change");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "act_cast_change",
                columns: table => new
                {
                    act_id = table.Column<int>(type: "integer", nullable: false),
                    person_id = table.Column<int>(type: "integer", nullable: false),
                    change = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_act_cast_change", x => new { x.act_id, x.person_id });
                    table.CheckConstraint(
                        "ck_act_cast_change_change",
                        "change IN ('Added', 'Removed')"
                    );
                    table.ForeignKey(
                        name: "fk_act_cast_change_act_act_id",
                        column: x => x.act_id,
                        principalTable: "act",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_act_cast_change_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_cast_change_person_id",
                table: "act_cast_change",
                column: "person_id"
            );

            migrationBuilder.NotifyChangesOf("act_cast_change");
        }
    }
}
