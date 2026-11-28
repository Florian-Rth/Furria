using Furria.Infrastructure.Changes;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class OneVersionForEveryEvening : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM choreography WHERE appearance_id IS NOT NULL;");

            migrationBuilder.DropForeignKey(
                name: "fk_choreography_appearance_appearance_id",
                table: "choreography"
            );

            migrationBuilder.DropTable(name: "appearance_cast_change");

            migrationBuilder.DropTable(name: "appearance_spot");

            migrationBuilder.DropIndex(
                name: "ix_choreography_act_id_session",
                table: "choreography"
            );

            migrationBuilder.DropIndex(
                name: "ix_choreography_appearance_id",
                table: "choreography"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_choreography_copied_from_version",
                table: "choreography"
            );

            migrationBuilder.DropColumn(name: "appearance_id", table: "choreography");

            migrationBuilder.DropColumn(name: "copied_from_version", table: "choreography");

            migrationBuilder.CreateIndex(
                name: "ix_choreography_act_id",
                table: "choreography",
                column: "act_id",
                unique: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(name: "ix_choreography_act_id", table: "choreography");

            migrationBuilder.AddColumn<int>(
                name: "appearance_id",
                table: "choreography",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "copied_from_version",
                table: "choreography",
                type: "integer",
                nullable: true
            );

            migrationBuilder.CreateTable(
                name: "appearance_cast_change",
                columns: table => new
                {
                    appearance_id = table.Column<int>(type: "integer", nullable: false),
                    person_id = table.Column<int>(type: "integer", nullable: false),
                    change = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey(
                        "pk_appearance_cast_change",
                        x => new { x.appearance_id, x.person_id }
                    );
                    table.CheckConstraint(
                        "ck_appearance_cast_change_change",
                        "change IN ('Added', 'Removed')"
                    );
                    table.ForeignKey(
                        name: "fk_appearance_cast_change_appearance_appearance_id",
                        column: x => x.appearance_id,
                        principalTable: "appearance",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_appearance_cast_change_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "appearance_spot",
                columns: table => new
                {
                    appearance_id = table.Column<int>(type: "integer", nullable: false),
                    spot_id = table.Column<int>(type: "integer", nullable: false),
                    person_id = table.Column<int>(type: "integer", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_appearance_spot", x => new { x.appearance_id, x.spot_id });
                    table.ForeignKey(
                        name: "fk_appearance_spot_appearance_appearance_id",
                        column: x => x.appearance_id,
                        principalTable: "appearance",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_appearance_spot_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_appearance_spot_spot_spot_id",
                        column: x => x.spot_id,
                        principalTable: "spot",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_choreography_act_id_session",
                table: "choreography",
                column: "act_id",
                unique: true,
                filter: "appearance_id IS NULL"
            );

            migrationBuilder.CreateIndex(
                name: "ix_choreography_appearance_id",
                table: "choreography",
                column: "appearance_id",
                unique: true
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_choreography_copied_from_version",
                table: "choreography",
                sql: "copied_from_version IS NULL OR appearance_id IS NOT NULL"
            );

            migrationBuilder.CreateIndex(
                name: "ix_appearance_cast_change_person_id",
                table: "appearance_cast_change",
                column: "person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_appearance_spot_person_id",
                table: "appearance_spot",
                column: "person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_appearance_spot_spot_id",
                table: "appearance_spot",
                column: "spot_id"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_choreography_appearance_appearance_id",
                table: "choreography",
                column: "appearance_id",
                principalTable: "appearance",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.NotifyChangesOf("appearance_cast_change");
            migrationBuilder.NotifyChangesOf("appearance_spot");
        }
    }
}
