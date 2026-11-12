using System;
using Furria.Infrastructure.Changes;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class GroupMatcher : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "group_matcher_joined_at",
                table: "group",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.CreateTable(
                name: "group_admission_age",
                columns: table => new
                {
                    group_id = table.Column<int>(type: "integer", nullable: false),
                    band = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_group_admission_age", x => new { x.group_id, x.band });
                    table.CheckConstraint(
                        "ck_group_admission_age_band",
                        "band IN ('UnderTwelve', 'TwelveToThirteen', 'FourteenToFifteen', 'SixteenToSeventeen', 'EighteenPlus')"
                    );
                    table.ForeignKey(
                        name: "fk_group_admission_age_group_group_id",
                        column: x => x.group_id,
                        principalTable: "group",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "group_matcher_statement",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    text = table.Column<string>(
                        type: "character varying(160)",
                        maxLength: 160,
                        nullable: false
                    ),
                    status = table.Column<string>(
                        type: "character varying(16)",
                        maxLength: 16,
                        nullable: false
                    ),
                    sort_order = table.Column<int>(type: "integer", nullable: true),
                    proposed_by_group_id = table.Column<int>(type: "integer", nullable: true),
                    approved_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    reworded_at = table.Column<DateTimeOffset>(
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
                    table.PrimaryKey("pk_group_matcher_statement", x => x.id);
                    table.CheckConstraint(
                        "ck_group_matcher_statement_approval",
                        "(status = 'Approved') = (sort_order IS NOT NULL AND approved_at IS NOT NULL)"
                    );
                    table.CheckConstraint(
                        "ck_group_matcher_statement_status",
                        "status IN ('Proposed', 'Approved', 'Rejected')"
                    );
                    table.ForeignKey(
                        name: "fk_group_matcher_statement_group_proposed_by_group_id",
                        column: x => x.proposed_by_group_id,
                        principalTable: "group",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "group_matcher_stance",
                columns: table => new
                {
                    group_id = table.Column<int>(type: "integer", nullable: false),
                    statement_id = table.Column<int>(type: "integer", nullable: false),
                    position = table.Column<string>(
                        type: "character varying(16)",
                        maxLength: 16,
                        nullable: false
                    ),
                    importance = table.Column<int>(type: "integer", nullable: false),
                    taken_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey(
                        "pk_group_matcher_stance",
                        x => new { x.group_id, x.statement_id }
                    );
                    table.CheckConstraint(
                        "ck_group_matcher_stance_importance",
                        "importance BETWEEN 1 AND 3"
                    );
                    table.CheckConstraint(
                        "ck_group_matcher_stance_position",
                        "position IN ('Yes', 'Neutral', 'No')"
                    );
                    table.ForeignKey(
                        name: "fk_group_matcher_stance_group_group_id",
                        column: x => x.group_id,
                        principalTable: "group",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_group_matcher_stance_group_matcher_statement_statement_id",
                        column: x => x.statement_id,
                        principalTable: "group_matcher_statement",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_group_matcher_stance_statement_id",
                table: "group_matcher_stance",
                column: "statement_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_group_matcher_statement_proposed_by_group_id",
                table: "group_matcher_statement",
                column: "proposed_by_group_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_group_matcher_statement_status_sort_order",
                table: "group_matcher_statement",
                columns: new[] { "status", "sort_order" }
            );

            migrationBuilder.Sql(
                """
                INSERT INTO group_matcher_statement (text, status, sort_order, approved_at)
                VALUES
                ('Ich erkenne Konfetti mit verbundenen Augen am Geräusch.', 'Approved', 1, now()),
                ('Meine Beine merken sich Schrittfolgen schneller als mein Kopf Telefonnummern.', 'Approved', 2, now()),
                ('Ich lache am liebsten über Witze, die ich nicht verstanden habe.', 'Approved', 3, now()),
                ('Elf Minuten reden, ohne Luft zu holen — rein organisatorisch machbar.', 'Approved', 4, now()),
                ('Steh ich allein auf der Bühne, fängt der Vorhang ein Gespräch an.', 'Approved', 5, now()),
                ('Eine Uniform sitzt richtig, wenn sie beim Gehen leise Marschmusik macht.', 'Approved', 6, now()),
                ('Ein Orden wird schwerer, je länger man ihn trägt. Physik interessiert mich da nicht.', 'Approved', 7, now()),
                ('Feste plane ich rückwärts: erst das Aufräumen, dann die Musik.', 'Approved', 8, now()),
                ('Ich kann eine Bierbank auf elf Arten falsch aufstellen — alle elf kenne ich.', 'Approved', 9, now()),
                ('Ein Kostüm ist gelungen, wenn mich mein eigener Spiegel nicht wiedererkennt.', 'Approved', 10, now());
                """
            );

            migrationBuilder.NotifyChangesOf("group_matcher_statement");
            migrationBuilder.NotifyChangesOf("group_matcher_stance");
            migrationBuilder.NotifyChangesOf("group_admission_age");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "group_admission_age");

            migrationBuilder.DropTable(name: "group_matcher_stance");

            migrationBuilder.DropTable(name: "group_matcher_statement");

            migrationBuilder.DropColumn(name: "group_matcher_joined_at", table: "group");
        }
    }
}
