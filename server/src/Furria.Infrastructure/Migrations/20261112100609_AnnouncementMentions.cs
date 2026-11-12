using Furria.Infrastructure.Changes;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AnnouncementMentions : Migration
    {
        private const string EscapePlainBodies = """
            UPDATE announcement AS target
            SET body = escaped.body
            FROM (
                SELECT id,
                    regexp_replace(
                    regexp_replace(
                    regexp_replace(
                    regexp_replace(
                    regexp_replace(
                    regexp_replace(body,
                        E'\r\n?|[\u0085\u2028\u2029\f]', E'\n', 'g'),
                        E'^[ \t\u00a0\u3000\u2000-\u200a]+', '', 'gn'),
                        '([\\*\[\]`]|<(?=[A-Za-z/!?]))', '\\\1', 'g'),
                        '^([#>+-])', '\\\1', 'gn'),
                        '^(_[-_ \t]*[-_][-_ \t]*[-_][-_ \t]*|=+[ \t]*|~~~.*)$', '\\\1', 'gn'),
                        '^([0-9]{1,9})([.)])(?=[ \t]|$)', '\1\\\2', 'gn') AS body
                FROM announcement
            ) AS escaped
            WHERE target.id = escaped.id AND target.body <> escaped.body;
            """;

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "body",
                table: "announcement",
                type: "character varying(8000)",
                maxLength: 8000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(4000)",
                oldMaxLength: 4000
            );

            migrationBuilder.CreateTable(
                name: "announcement_mention",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    announcement_id = table.Column<int>(type: "integer", nullable: false),
                    kind = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    target_id = table.Column<int>(type: "integer", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_announcement_mention", x => x.id);
                    table.CheckConstraint(
                        "ck_announcement_mention_kind",
                        "kind IN ('Group', 'Person', 'CalendarEntry', 'Event', 'NewsPost', 'Album')"
                    );
                    table.CheckConstraint(
                        "ck_announcement_mention_target_id_positive",
                        "target_id > 0"
                    );
                    table.ForeignKey(
                        name: "fk_announcement_mention_announcement_announcement_id",
                        column: x => x.announcement_id,
                        principalTable: "announcement",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_announcement_mention_announcement_id_kind_target_id",
                table: "announcement_mention",
                columns: new[] { "announcement_id", "kind", "target_id" },
                unique: true
            );

            migrationBuilder.NotifyChangesOf("announcement_mention");
            migrationBuilder.Sql(EscapePlainBodies);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "announcement_mention");

            migrationBuilder.AlterColumn<string>(
                name: "body",
                table: "announcement",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(8000)",
                oldMaxLength: 8000
            );
        }
    }
}
