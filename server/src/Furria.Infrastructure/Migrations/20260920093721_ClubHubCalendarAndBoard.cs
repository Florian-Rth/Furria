using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ClubHubCalendarAndBoard : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "last_seen_announcement_at",
                table: "account",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.CreateTable(
                name: "announcement",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    author_person_id = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(
                        type: "character varying(120)",
                        maxLength: 120,
                        nullable: false
                    ),
                    body = table.Column<string>(
                        type: "character varying(4000)",
                        maxLength: 4000,
                        nullable: false
                    ),
                    published_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    valid_until = table.Column<DateOnly>(type: "date", nullable: true),
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
                    table.PrimaryKey("pk_announcement", x => x.id);
                    table.ForeignKey(
                        name: "fk_announcement_person_author_person_id",
                        column: x => x.author_person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "board_office",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    implied_role_id = table.Column<int>(type: "integer", nullable: true),
                    name = table.Column<string>(
                        type: "character varying(80)",
                        maxLength: 80,
                        nullable: false,
                        collation: "de-DE-x-icu"
                    ),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("pk_board_office", x => x.id);
                    table.ForeignKey(
                        name: "fk_board_office_role_implied_role_id",
                        column: x => x.implied_role_id,
                        principalTable: "role",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "calendar_entry",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    venue_id = table.Column<int>(type: "integer", nullable: true),
                    owner_group_id = table.Column<int>(type: "integer", nullable: true),
                    title = table.Column<string>(
                        type: "character varying(120)",
                        maxLength: 120,
                        nullable: false
                    ),
                    description = table.Column<string>(
                        type: "character varying(2000)",
                        maxLength: 2000,
                        nullable: true
                    ),
                    starts_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    ends_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    kind = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    visibility = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false,
                        defaultValue: "Club"
                    ),
                    asks_for_response = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
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
                    table.PrimaryKey("pk_calendar_entry", x => x.id);
                    table.CheckConstraint(
                        "ck_calendar_entry_kind",
                        "kind IN ('Training', 'Rehearsal', 'Performance', 'Meeting', 'Party', 'Other')"
                    );
                    table.CheckConstraint(
                        "ck_calendar_entry_owner_visibility",
                        "owner_group_id IS NOT NULL OR visibility <> 'Group'"
                    );
                    table.CheckConstraint(
                        "ck_calendar_entry_visibility",
                        "visibility IN ('Group', 'Club', 'Public')"
                    );
                    table.CheckConstraint(
                        "ck_calendar_entry_window",
                        "ends_at IS NULL OR ends_at >= starts_at"
                    );
                    table.ForeignKey(
                        name: "fk_calendar_entry_group_owner_group_id",
                        column: x => x.owner_group_id,
                        principalTable: "group",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                    table.ForeignKey(
                        name: "fk_calendar_entry_venue_venue_id",
                        column: x => x.venue_id,
                        principalTable: "venue",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "key_holding",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    venue_id = table.Column<int>(type: "integer", nullable: false),
                    person_id = table.Column<int>(type: "integer", nullable: false),
                    since_on = table.Column<DateOnly>(type: "date", nullable: false),
                    until_on = table.Column<DateOnly>(type: "date", nullable: true),
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
                    table.PrimaryKey("pk_key_holding", x => x.id);
                    table.CheckConstraint(
                        "ck_key_holding_period",
                        "until_on IS NULL OR until_on >= since_on"
                    );
                    table.ForeignKey(
                        name: "fk_key_holding_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict
                    );
                    table.ForeignKey(
                        name: "fk_key_holding_venue_venue_id",
                        column: x => x.venue_id,
                        principalTable: "venue",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "board_seat",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    board_office_id = table.Column<int>(type: "integer", nullable: false),
                    person_id = table.Column<int>(type: "integer", nullable: false),
                    since_on = table.Column<DateOnly>(type: "date", nullable: false),
                    until_on = table.Column<DateOnly>(type: "date", nullable: true),
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
                    table.PrimaryKey("pk_board_seat", x => x.id);
                    table.CheckConstraint(
                        "ck_board_seat_period",
                        "until_on IS NULL OR until_on >= since_on"
                    );
                    table.ForeignKey(
                        name: "fk_board_seat_board_office_board_office_id",
                        column: x => x.board_office_id,
                        principalTable: "board_office",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_board_seat_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "attendance_response",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    calendar_entry_id = table.Column<int>(type: "integer", nullable: false),
                    person_id = table.Column<int>(type: "integer", nullable: false),
                    answer = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
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
                    table.PrimaryKey("pk_attendance_response", x => x.id);
                    table.CheckConstraint(
                        "ck_attendance_response_answer",
                        "answer IN ('Yes', 'No', 'Maybe')"
                    );
                    table.ForeignKey(
                        name: "fk_attendance_response_calendar_entry_calendar_entry_id",
                        column: x => x.calendar_entry_id,
                        principalTable: "calendar_entry",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_attendance_response_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_announcement_author_person_id",
                table: "announcement",
                column: "author_person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_announcement_published_at",
                table: "announcement",
                column: "published_at"
            );

            migrationBuilder.CreateIndex(
                name: "ix_attendance_response_calendar_entry_id_person_id",
                table: "attendance_response",
                columns: new[] { "calendar_entry_id", "person_id" },
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_attendance_response_person_id",
                table: "attendance_response",
                column: "person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_board_office_implied_role_id",
                table: "board_office",
                column: "implied_role_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_board_office_name",
                table: "board_office",
                column: "name",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_board_seat_board_office_id",
                table: "board_seat",
                column: "board_office_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_board_seat_person_id",
                table: "board_seat",
                column: "person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_calendar_entry_owner_group_id",
                table: "calendar_entry",
                column: "owner_group_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_calendar_entry_starts_at",
                table: "calendar_entry",
                column: "starts_at"
            );

            migrationBuilder.CreateIndex(
                name: "ix_calendar_entry_venue_id_starts_at",
                table: "calendar_entry",
                columns: new[] { "venue_id", "starts_at" }
            );

            migrationBuilder.CreateIndex(
                name: "ix_key_holding_person_id",
                table: "key_holding",
                column: "person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_key_holding_venue_id",
                table: "key_holding",
                column: "venue_id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "announcement");

            migrationBuilder.DropTable(name: "attendance_response");

            migrationBuilder.DropTable(name: "board_seat");

            migrationBuilder.DropTable(name: "key_holding");

            migrationBuilder.DropTable(name: "calendar_entry");

            migrationBuilder.DropTable(name: "board_office");

            migrationBuilder.DropColumn(name: "last_seen_announcement_at", table: "account");
        }
    }
}
