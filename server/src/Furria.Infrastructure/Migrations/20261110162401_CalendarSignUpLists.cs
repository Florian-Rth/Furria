using System;
using Furria.Infrastructure.Changes;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CalendarSignUpLists : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "calendar_sign_up_list",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    calendar_entry_id = table.Column<int>(type: "integer", nullable: false),
                    position = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(
                        type: "character varying(120)",
                        maxLength: 120,
                        nullable: false
                    ),
                    hint = table.Column<string>(
                        type: "character varying(300)",
                        maxLength: 300,
                        nullable: true
                    ),
                    sign_up_until = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
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
                    table.PrimaryKey("pk_calendar_sign_up_list", x => x.id);
                    table.CheckConstraint(
                        "ck_calendar_sign_up_list_hint",
                        "hint IS NULL OR btrim(hint) <> ''"
                    );
                    table.CheckConstraint("ck_calendar_sign_up_list_position", "position >= 0");
                    table.CheckConstraint("ck_calendar_sign_up_list_title", "btrim(title) <> ''");
                    table.ForeignKey(
                        name: "fk_calendar_sign_up_list_calendar_entry_calendar_entry_id",
                        column: x => x.calendar_entry_id,
                        principalTable: "calendar_entry",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "calendar_sign_up_line",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    sign_up_list_id = table.Column<int>(type: "integer", nullable: false),
                    person_id = table.Column<int>(type: "integer", nullable: false),
                    text = table.Column<string>(
                        type: "character varying(120)",
                        maxLength: 120,
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
                    table.PrimaryKey("pk_calendar_sign_up_line", x => x.id);
                    table.CheckConstraint(
                        "ck_calendar_sign_up_line_text",
                        "text IS NULL OR btrim(text) <> ''"
                    );
                    table.ForeignKey(
                        name: "fk_calendar_sign_up_line_calendar_sign_up_list_sign_up_list_id",
                        column: x => x.sign_up_list_id,
                        principalTable: "calendar_sign_up_list",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_calendar_sign_up_line_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_calendar_sign_up_line_person_id",
                table: "calendar_sign_up_line",
                column: "person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_calendar_sign_up_line_sign_up_list_id_person_id",
                table: "calendar_sign_up_line",
                columns: new[] { "sign_up_list_id", "person_id" },
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_calendar_sign_up_list_calendar_entry_id",
                table: "calendar_sign_up_list",
                column: "calendar_entry_id"
            );

            migrationBuilder.NotifyChangesOf("calendar_sign_up_list");
            migrationBuilder.NotifyChangesOf("calendar_sign_up_line");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "calendar_sign_up_line");

            migrationBuilder.DropTable(name: "calendar_sign_up_list");
        }
    }
}
