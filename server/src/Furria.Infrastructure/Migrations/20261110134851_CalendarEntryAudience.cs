using System;
using Furria.Infrastructure.Changes;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CalendarEntryAudience : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_calendar_entry_event_public",
                table: "calendar_entry"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_calendar_entry_owner_visibility",
                table: "calendar_entry"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_calendar_entry_visibility",
                table: "calendar_entry"
            );

            migrationBuilder.RenameColumn(
                name: "visibility",
                table: "calendar_entry",
                newName: "audience"
            );

            migrationBuilder.CreateTable(
                name: "calendar_entry_audience_group",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    calendar_entry_id = table.Column<int>(type: "integer", nullable: false),
                    group_id = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("pk_calendar_entry_audience_group", x => x.id);
                    table.ForeignKey(
                        name: "fk_calendar_entry_audience_group_calendar_entry_calendar_entry_id",
                        column: x => x.calendar_entry_id,
                        principalTable: "calendar_entry",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_calendar_entry_audience_group_group_group_id",
                        column: x => x.group_id,
                        principalTable: "group",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "calendar_entry_audience_person",
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
                    table.PrimaryKey("pk_calendar_entry_audience_person", x => x.id);
                    table.ForeignKey(
                        name: "fk_calendar_entry_audience_person_calendar_entry_calendar_entry_id",
                        column: x => x.calendar_entry_id,
                        principalTable: "calendar_entry",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_calendar_entry_audience_person_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.NotifyChangesOf("calendar_entry_audience_group");
            migrationBuilder.NotifyChangesOf("calendar_entry_audience_person");

            migrationBuilder.Sql(
                """
                INSERT INTO calendar_entry_audience_group (calendar_entry_id, group_id)
                SELECT entry.id, entry.owner_group_id
                FROM calendar_entry entry
                WHERE entry.owner_group_id IS NOT NULL
                UNION
                SELECT link.calendar_entry_id, link.group_id
                FROM calendar_entry_group link
                JOIN calendar_entry entry ON entry.id = link.calendar_entry_id
                WHERE entry.owner_group_id IS NOT NULL;
                """
            );

            migrationBuilder.Sql(
                """
                UPDATE calendar_entry
                SET audience = CASE WHEN owner_group_id IS NULL THEN 'Club' ELSE 'Groups' END;
                """
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_calendar_entry_audience",
                table: "calendar_entry",
                sql: "audience IN ('Club', 'Groups', 'People')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_calendar_entry_event_club",
                table: "calendar_entry",
                sql: "kind <> 'Event' OR (audience = 'Club' AND owner_group_id IS NULL)"
            );

            migrationBuilder.CreateIndex(
                name: "ix_calendar_entry_audience_group_calendar_entry_id_group_id",
                table: "calendar_entry_audience_group",
                columns: new[] { "calendar_entry_id", "group_id" },
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_calendar_entry_audience_group_group_id",
                table: "calendar_entry_audience_group",
                column: "group_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_calendar_entry_audience_person_calendar_entry_id_person_id",
                table: "calendar_entry_audience_person",
                columns: new[] { "calendar_entry_id", "person_id" },
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_calendar_entry_audience_person_person_id",
                table: "calendar_entry_audience_person",
                column: "person_id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_calendar_entry_audience",
                table: "calendar_entry"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_calendar_entry_event_club",
                table: "calendar_entry"
            );

            migrationBuilder.Sql(
                """
                UPDATE calendar_entry
                SET audience = CASE
                    WHEN kind = 'Event' THEN 'Public'
                    WHEN owner_group_id IS NULL THEN 'Club'
                    ELSE 'Group'
                END;
                """
            );

            migrationBuilder.DropTable(name: "calendar_entry_audience_group");

            migrationBuilder.DropTable(name: "calendar_entry_audience_person");

            migrationBuilder.RenameColumn(
                name: "audience",
                table: "calendar_entry",
                newName: "visibility"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_calendar_entry_event_public",
                table: "calendar_entry",
                sql: "kind <> 'Event' OR (visibility = 'Public' AND owner_group_id IS NULL)"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_calendar_entry_owner_visibility",
                table: "calendar_entry",
                sql: "owner_group_id IS NOT NULL OR visibility <> 'Group'"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_calendar_entry_visibility",
                table: "calendar_entry",
                sql: "visibility IN ('Group', 'Club', 'Public')"
            );
        }
    }
}
