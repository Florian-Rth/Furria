using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class TrainingIsNeverForTheClub : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                INSERT INTO calendar_entry_audience_group (calendar_entry_id, group_id)
                SELECT entry.id, link.group_id
                FROM calendar_entry entry
                JOIN calendar_entry_group link ON link.calendar_entry_id = entry.id
                WHERE entry.kind = 'Training' AND entry.audience = 'Club'
                ON CONFLICT DO NOTHING;
                """
            );

            migrationBuilder.Sql(
                """
                UPDATE calendar_entry entry
                SET audience = 'Groups'
                WHERE entry.kind = 'Training' AND entry.audience = 'Club'
                    AND EXISTS (
                        SELECT 1 FROM calendar_entry_audience_group link
                        WHERE link.calendar_entry_id = entry.id
                    );
                """
            );

            migrationBuilder.Sql(
                """
                UPDATE calendar_entry
                SET kind = 'Plain'
                WHERE kind = 'Training' AND audience = 'Club';
                """
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_calendar_entry_training_not_club",
                table: "calendar_entry",
                sql: "kind <> 'Training' OR audience <> 'Club'"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_calendar_entry_training_not_club",
                table: "calendar_entry"
            );
        }
    }
}
