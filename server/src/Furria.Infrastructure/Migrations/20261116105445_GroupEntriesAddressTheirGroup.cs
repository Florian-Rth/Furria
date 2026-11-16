using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class GroupEntriesAddressTheirGroup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                INSERT INTO calendar_entry_audience_group (calendar_entry_id, group_id)
                SELECT entry.id, entry.owner_group_id
                FROM calendar_entry entry
                WHERE entry.owner_group_id IS NOT NULL AND entry.audience = 'Club'
                ON CONFLICT DO NOTHING;
                """
            );

            migrationBuilder.Sql(
                """
                UPDATE calendar_entry
                SET audience = 'Groups'
                WHERE owner_group_id IS NOT NULL AND audience = 'Club';
                """
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder) { }
    }
}
