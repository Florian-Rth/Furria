using System;
using Furria.Infrastructure.Changes;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CalendarPolls : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "calendar_poll",
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
                    question = table.Column<string>(
                        type: "character varying(200)",
                        maxLength: 200,
                        nullable: false
                    ),
                    allows_multiple_choices = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    is_anonymous = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    votes_until = table.Column<DateTimeOffset>(
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
                    table.PrimaryKey("pk_calendar_poll", x => x.id);
                    table.CheckConstraint("ck_calendar_poll_position", "position >= 0");
                    table.CheckConstraint("ck_calendar_poll_question", "btrim(question) <> ''");
                    table.ForeignKey(
                        name: "fk_calendar_poll_calendar_entry_calendar_entry_id",
                        column: x => x.calendar_entry_id,
                        principalTable: "calendar_entry",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "calendar_poll_option",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    poll_id = table.Column<int>(type: "integer", nullable: false),
                    position = table.Column<int>(type: "integer", nullable: false),
                    label = table.Column<string>(
                        type: "character varying(120)",
                        maxLength: 120,
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
                    table.PrimaryKey("pk_calendar_poll_option", x => x.id);
                    table.UniqueConstraint(
                        "ak_calendar_poll_option_poll_id_id",
                        x => new { x.poll_id, x.id }
                    );
                    table.CheckConstraint("ck_calendar_poll_option_label", "btrim(label) <> ''");
                    table.CheckConstraint("ck_calendar_poll_option_position", "position >= 0");
                    table.ForeignKey(
                        name: "fk_calendar_poll_option_calendar_poll_poll_id",
                        column: x => x.poll_id,
                        principalTable: "calendar_poll",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "calendar_poll_vote",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    poll_id = table.Column<int>(type: "integer", nullable: false),
                    poll_option_id = table.Column<int>(type: "integer", nullable: false),
                    person_id = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("pk_calendar_poll_vote", x => x.id);
                    table.ForeignKey(
                        name: "fk_calendar_poll_vote_calendar_poll_option_poll_id_poll_option_id",
                        columns: x => new { x.poll_id, x.poll_option_id },
                        principalTable: "calendar_poll_option",
                        principalColumns: new[] { "poll_id", "id" },
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_calendar_poll_vote_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_calendar_poll_calendar_entry_id",
                table: "calendar_poll",
                column: "calendar_entry_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_calendar_poll_vote_person_id",
                table: "calendar_poll_vote",
                column: "person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_calendar_poll_vote_poll_id_person_id",
                table: "calendar_poll_vote",
                columns: new[] { "poll_id", "person_id" }
            );

            migrationBuilder.CreateIndex(
                name: "ix_calendar_poll_vote_poll_id_poll_option_id_person_id",
                table: "calendar_poll_vote",
                columns: new[] { "poll_id", "poll_option_id", "person_id" },
                unique: true
            );

            migrationBuilder.NotifyChangesOf("calendar_poll");
            migrationBuilder.NotifyChangesOf("calendar_poll_option");
            migrationBuilder.NotifyChangesOf("calendar_poll_vote");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "calendar_poll_vote");

            migrationBuilder.DropTable(name: "calendar_poll_option");

            migrationBuilder.DropTable(name: "calendar_poll");
        }
    }
}
