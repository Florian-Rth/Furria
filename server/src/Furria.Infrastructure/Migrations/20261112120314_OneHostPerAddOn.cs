using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class OneHostPerAddOn : Migration
    {
        private const string OneHost = "num_nonnulls(calendar_entry_id, announcement_id) = 1";

        private static readonly (string Old, string New)[] Tables =
        [
            ("calendar_poll", "poll"),
            ("calendar_poll_option", "poll_option"),
            ("calendar_poll_vote", "poll_vote"),
            ("calendar_sign_up_list", "sign_up_list"),
            ("calendar_sign_up_line", "sign_up_line"),
        ];

        private static readonly (string Table, string Old)[] Constraints =
        [
            ("poll", "pk_calendar_poll"),
            ("poll", "ck_calendar_poll_position"),
            ("poll", "ck_calendar_poll_question"),
            ("poll", "fk_calendar_poll_calendar_entry_calendar_entry_id"),
            ("poll", "fk_calendar_poll_person_closed_by_person_id"),
            ("poll_option", "pk_calendar_poll_option"),
            ("poll_option", "ak_calendar_poll_option_poll_id_id"),
            ("poll_option", "ck_calendar_poll_option_position"),
            ("poll_option", "ck_calendar_poll_option_label"),
            ("poll_option", "fk_calendar_poll_option_calendar_poll_poll_id"),
            ("poll_vote", "pk_calendar_poll_vote"),
            ("poll_vote", "fk_calendar_poll_vote_calendar_poll_option_poll_id_poll_option_id"),
            ("poll_vote", "fk_calendar_poll_vote_person_person_id"),
            ("sign_up_list", "pk_calendar_sign_up_list"),
            ("sign_up_list", "ck_calendar_sign_up_list_position"),
            ("sign_up_list", "ck_calendar_sign_up_list_title"),
            ("sign_up_list", "ck_calendar_sign_up_list_hint"),
            ("sign_up_list", "fk_calendar_sign_up_list_calendar_entry_calendar_entry_id"),
            ("sign_up_list", "fk_calendar_sign_up_list_person_closed_by_person_id"),
            ("sign_up_line", "pk_calendar_sign_up_line"),
            ("sign_up_line", "ck_calendar_sign_up_line_text"),
            ("sign_up_line", "fk_calendar_sign_up_line_calendar_sign_up_list_sign_up_list_id"),
            ("sign_up_line", "fk_calendar_sign_up_line_person_person_id"),
        ];

        private static readonly string[] Indexes =
        [
            "ix_calendar_poll_calendar_entry_id",
            "ix_calendar_poll_closed_by_person_id",
            "ix_calendar_poll_vote_poll_id_poll_option_id_person_id",
            "ix_calendar_poll_vote_poll_id_person_id",
            "ix_calendar_poll_vote_person_id",
            "ix_calendar_sign_up_list_calendar_entry_id",
            "ix_calendar_sign_up_list_closed_by_person_id",
            "ix_calendar_sign_up_line_sign_up_list_id_person_id",
            "ix_calendar_sign_up_line_person_id",
        ];

        private static readonly string[] HostedTables =
        [
            "poll",
            "sign_up_list",
            "attendance_response",
        ];

        private static string NeutralNameOf(string name) =>
            name.Replace("calendar_poll", "poll").Replace("calendar_sign_up", "sign_up");

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            foreach (var (old, neutral) in Tables)
            {
                migrationBuilder.RenameTable(name: old, newName: neutral);
                migrationBuilder.Sql($"ALTER SEQUENCE {old}_id_seq RENAME TO {neutral}_id_seq;");
            }

            foreach (var (table, old) in Constraints)
                migrationBuilder.Sql(
                    $"ALTER TABLE {table} RENAME CONSTRAINT {old} TO {NeutralNameOf(old)};"
                );

            foreach (var old in Indexes)
                migrationBuilder.RenameIndex(name: old, newName: NeutralNameOf(old));

            foreach (var table in HostedTables)
                AddAnnouncementHost(migrationBuilder, table);

            migrationBuilder.CreateIndex(
                name: "ix_poll_announcement_id",
                table: "poll",
                column: "announcement_id"
            );
            migrationBuilder.CreateIndex(
                name: "ix_sign_up_list_announcement_id",
                table: "sign_up_list",
                column: "announcement_id"
            );
            migrationBuilder.CreateIndex(
                name: "ix_attendance_response_announcement_id_person_id",
                table: "attendance_response",
                columns: ["announcement_id", "person_id"],
                unique: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_attendance_response_announcement_id_person_id",
                table: "attendance_response"
            );
            migrationBuilder.DropIndex(
                name: "ix_sign_up_list_announcement_id",
                table: "sign_up_list"
            );
            migrationBuilder.DropIndex(name: "ix_poll_announcement_id", table: "poll");

            foreach (var table in HostedTables)
                DropAnnouncementHost(migrationBuilder, table);

            foreach (var old in Indexes)
                migrationBuilder.RenameIndex(name: NeutralNameOf(old), newName: old);

            foreach (var (table, old) in Constraints)
                migrationBuilder.Sql(
                    $"ALTER TABLE {table} RENAME CONSTRAINT {NeutralNameOf(old)} TO {old};"
                );

            foreach (var (old, neutral) in Tables)
            {
                migrationBuilder.Sql($"ALTER SEQUENCE {neutral}_id_seq RENAME TO {old}_id_seq;");
                migrationBuilder.RenameTable(name: neutral, newName: old);
            }
        }

        private static void AddAnnouncementHost(MigrationBuilder migrationBuilder, string table)
        {
            migrationBuilder.AlterColumn<int>(
                name: "calendar_entry_id",
                table: table,
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer"
            );
            migrationBuilder.AddColumn<int>(
                name: "announcement_id",
                table: table,
                type: "integer",
                nullable: true
            );
            migrationBuilder.AddForeignKey(
                name: $"fk_{table}_announcement_announcement_id",
                table: table,
                column: "announcement_id",
                principalTable: "announcement",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );
            migrationBuilder.AddCheckConstraint(
                name: $"ck_{table}_one_host",
                table: table,
                sql: OneHost
            );
        }

        private static void DropAnnouncementHost(MigrationBuilder migrationBuilder, string table)
        {
            migrationBuilder.Sql($"DELETE FROM {table} WHERE announcement_id IS NOT NULL;");
            migrationBuilder.DropCheckConstraint(name: $"ck_{table}_one_host", table: table);
            migrationBuilder.DropForeignKey(
                name: $"fk_{table}_announcement_announcement_id",
                table: table
            );
            migrationBuilder.DropColumn(name: "announcement_id", table: table);
            migrationBuilder.AlterColumn<int>(
                name: "calendar_entry_id",
                table: table,
                type: "integer",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true
            );
        }
    }
}
