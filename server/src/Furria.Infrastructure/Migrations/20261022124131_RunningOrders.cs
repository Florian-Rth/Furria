using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RunningOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "act",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    name = table.Column<string>(
                        type: "character varying(80)",
                        maxLength: 80,
                        nullable: false,
                        collation: "de-DE-x-icu"
                    ),
                    group_id = table.Column<int>(type: "integer", nullable: true),
                    kind = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: true
                    ),
                    archived_at = table.Column<DateTimeOffset>(
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
                    table.PrimaryKey("pk_act", x => x.id);
                    table.CheckConstraint(
                        "ck_act_kind",
                        "kind IS NULL OR kind IN ('Dance', 'Speech', 'Music', 'Show', 'Point')"
                    );
                    table.ForeignKey(
                        name: "fk_act_group_group_id",
                        column: x => x.group_id,
                        principalTable: "group",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "running_order",
                columns: table => new
                {
                    calendar_entry_id = table.Column<int>(type: "integer", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false),
                    confirmed_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    changed_since_confirmed = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("pk_running_order", x => x.calendar_entry_id);
                    table.ForeignKey(
                        name: "fk_running_order_calendar_entry_calendar_entry_id",
                        column: x => x.calendar_entry_id,
                        principalTable: "calendar_entry",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

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

            migrationBuilder.CreateTable(
                name: "act_wish",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    act_id = table.Column<int>(type: "integer", nullable: false),
                    kind = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    strength = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_act_wish", x => x.id);
                    table.CheckConstraint(
                        "ck_act_wish_kind",
                        "kind IN ('First', 'Last', 'FirstHalf', 'SecondHalf', 'Early', 'Late')"
                    );
                    table.CheckConstraint("ck_act_wish_strength", "strength IN ('Must', 'Prefer')");
                    table.ForeignKey(
                        name: "fk_act_wish_act_act_id",
                        column: x => x.act_id,
                        principalTable: "act",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

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
                    calendar_entry_id = table.Column<int>(type: "integer", nullable: false),
                    act_id = table.Column<int>(type: "integer", nullable: false),
                    position = table.Column<int>(type: "integer", nullable: true),
                    is_pinned = table.Column<bool>(type: "boolean", nullable: false),
                    block_key = table.Column<int>(type: "integer", nullable: true),
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

            migrationBuilder.CreateTable(
                name: "running_order_rule",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    calendar_entry_id = table.Column<int>(type: "integer", nullable: false),
                    kind = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    strength = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    act_id = table.Column<int>(type: "integer", nullable: true),
                    other_act_id = table.Column<int>(type: "integer", nullable: true),
                    act_kind = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: true
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_running_order_rule", x => x.id);
                    table.CheckConstraint(
                        "ck_running_order_rule_act_kind",
                        "act_kind IS NULL OR act_kind IN ('Dance', 'Speech', 'Music', 'Show', 'Point')"
                    );
                    table.CheckConstraint(
                        "ck_running_order_rule_kind",
                        "kind IN ('First', 'Last', 'FirstHalf', 'SecondHalf', 'Early', 'Late', 'Before', 'After', 'Apart', 'KindSpread')"
                    );
                    table.CheckConstraint(
                        "ck_running_order_rule_strength",
                        "strength IN ('Must', 'Prefer')"
                    );
                    table.ForeignKey(
                        name: "fk_running_order_rule_act_act_id",
                        column: x => x.act_id,
                        principalTable: "act",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict
                    );
                    table.ForeignKey(
                        name: "fk_running_order_rule_act_other_act_id",
                        column: x => x.other_act_id,
                        principalTable: "act",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict
                    );
                    table.ForeignKey(
                        name: "fk_running_order_rule_running_order_calendar_entry_id",
                        column: x => x.calendar_entry_id,
                        principalTable: "running_order",
                        principalColumn: "calendar_entry_id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "running_order_suspended_wish",
                columns: table => new
                {
                    calendar_entry_id = table.Column<int>(type: "integer", nullable: false),
                    act_wish_id = table.Column<int>(type: "integer", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey(
                        "pk_running_order_suspended_wish",
                        x => new { x.calendar_entry_id, x.act_wish_id }
                    );
                    table.ForeignKey(
                        name: "fk_running_order_suspended_wish_act_wish_act_wish_id",
                        column: x => x.act_wish_id,
                        principalTable: "act_wish",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_running_order_suspended_wish_running_order_calendar_entry_id",
                        column: x => x.calendar_entry_id,
                        principalTable: "running_order",
                        principalColumn: "calendar_entry_id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(name: "ix_act_group_id", table: "act", column: "group_id");

            migrationBuilder.CreateIndex(
                name: "ix_act_cast_change_person_id",
                table: "act_cast_change",
                column: "person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_wish_act_id_kind",
                table: "act_wish",
                columns: new[] { "act_id", "kind" },
                unique: true
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

            migrationBuilder.CreateIndex(
                name: "ix_running_order_rule_act_id",
                table: "running_order_rule",
                column: "act_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_running_order_rule_calendar_entry_id",
                table: "running_order_rule",
                column: "calendar_entry_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_running_order_rule_other_act_id",
                table: "running_order_rule",
                column: "other_act_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_running_order_suspended_wish_act_wish_id",
                table: "running_order_suspended_wish",
                column: "act_wish_id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "act_cast_change");

            migrationBuilder.DropTable(name: "running_order_line");

            migrationBuilder.DropTable(name: "running_order_rule");

            migrationBuilder.DropTable(name: "running_order_suspended_wish");

            migrationBuilder.DropTable(name: "act_wish");

            migrationBuilder.DropTable(name: "running_order");

            migrationBuilder.DropTable(name: "act");
        }
    }
}
