using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Appearance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "appearance",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    calendar_entry_id = table.Column<int>(type: "integer", nullable: false),
                    act_id = table.Column<int>(type: "integer", nullable: false),
                    position = table.Column<int>(type: "integer", nullable: true),
                    is_pinned = table.Column<bool>(type: "boolean", nullable: false),
                    block_key = table.Column<int>(type: "integer", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_appearance", x => x.id);
                    table.CheckConstraint(
                        "ck_appearance_position",
                        "position IS NULL OR position >= 0"
                    );
                    table.ForeignKey(
                        name: "fk_appearance_act_act_id",
                        column: x => x.act_id,
                        principalTable: "act",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict
                    );
                    table.ForeignKey(
                        name: "fk_appearance_calendar_entry_calendar_entry_id",
                        column: x => x.calendar_entry_id,
                        principalTable: "calendar_entry",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
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

            migrationBuilder.CreateIndex(
                name: "ix_appearance_act_id",
                table: "appearance",
                column: "act_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_appearance_calendar_entry_id_act_id",
                table: "appearance",
                columns: new[] { "calendar_entry_id", "act_id" },
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_appearance_cast_change_person_id",
                table: "appearance_cast_change",
                column: "person_id"
            );

            migrationBuilder.Sql(
                """
                INSERT INTO appearance (id, calendar_entry_id, act_id, position, is_pinned, block_key)
                OVERRIDING SYSTEM VALUE
                SELECT id, calendar_entry_id, act_id, position, is_pinned, block_key
                FROM running_order_line;

                SELECT setval(
                    pg_get_serial_sequence('appearance', 'id'),
                    COALESCE((SELECT MAX(id) FROM appearance), 0) + 1,
                    false
                );
                """
            );

            migrationBuilder.DropTable(name: "running_order_line");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "running_order_line",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    act_id = table.Column<int>(type: "integer", nullable: false),
                    calendar_entry_id = table.Column<int>(type: "integer", nullable: false),
                    block_key = table.Column<int>(type: "integer", nullable: true),
                    is_pinned = table.Column<bool>(type: "boolean", nullable: false),
                    position = table.Column<int>(type: "integer", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_running_order_line", x => x.id);
                    table.CheckConstraint(
                        "ck_running_order_line_position",
                        "position IS NULL OR position >= 0"
                    );
                    table.ForeignKey(
                        name: "fk_running_order_line_act_act_id",
                        column: x => x.act_id,
                        principalTable: "act",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict
                    );
                    table.ForeignKey(
                        name: "fk_running_order_line_running_order_calendar_entry_id",
                        column: x => x.calendar_entry_id,
                        principalTable: "running_order",
                        principalColumn: "calendar_entry_id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_running_order_line_act_id",
                table: "running_order_line",
                column: "act_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_running_order_line_calendar_entry_id_act_id",
                table: "running_order_line",
                columns: new[] { "calendar_entry_id", "act_id" },
                unique: true
            );

            migrationBuilder.Sql(
                """
                INSERT INTO running_order_line (id, calendar_entry_id, act_id, position, is_pinned, block_key)
                OVERRIDING SYSTEM VALUE
                SELECT appearance.id, appearance.calendar_entry_id, appearance.act_id,
                       appearance.position, appearance.is_pinned, appearance.block_key
                FROM appearance
                JOIN running_order ON running_order.calendar_entry_id = appearance.calendar_entry_id;

                SELECT setval(
                    pg_get_serial_sequence('running_order_line', 'id'),
                    COALESCE((SELECT MAX(id) FROM running_order_line), 0) + 1,
                    false
                );
                """
            );

            migrationBuilder.DropTable(name: "appearance_cast_change");

            migrationBuilder.DropTable(name: "appearance");
        }
    }
}
