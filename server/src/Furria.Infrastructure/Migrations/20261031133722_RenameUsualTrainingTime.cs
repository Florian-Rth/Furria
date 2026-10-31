using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameUsualTrainingTime : Migration
    {
        private const string Weekdays =
            "weekday IN ('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')";
        private const string Duration = "duration_minutes > 0 AND duration_minutes <= 480";

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            Rename(migrationBuilder, "group_training_slot", "usual_training_time");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            Rename(migrationBuilder, "usual_training_time", "group_training_slot");
        }

        private static void Rename(MigrationBuilder migrationBuilder, string from, string to)
        {
            migrationBuilder.DropCheckConstraint(name: $"ck_{from}_duration", table: from);
            migrationBuilder.DropCheckConstraint(name: $"ck_{from}_weekday", table: from);

            migrationBuilder.RenameTable(name: from, newName: to);

            migrationBuilder.Sql(
                $"""
                ALTER TABLE {to} RENAME CONSTRAINT pk_{from} TO pk_{to};
                ALTER TABLE {to} RENAME CONSTRAINT fk_{from}_group_group_id TO fk_{to}_group_group_id;
                ALTER TABLE {to} RENAME CONSTRAINT fk_{from}_venue_venue_id TO fk_{to}_venue_venue_id;
                ALTER SEQUENCE IF EXISTS {from}_id_seq RENAME TO {to}_id_seq;
                """
            );

            migrationBuilder.RenameIndex(
                name: $"ix_{from}_group_id",
                table: to,
                newName: $"ix_{to}_group_id"
            );
            migrationBuilder.RenameIndex(
                name: $"ix_{from}_venue_id",
                table: to,
                newName: $"ix_{to}_venue_id"
            );

            migrationBuilder.AddCheckConstraint(
                name: $"ck_{to}_duration",
                table: to,
                sql: Duration
            );
            migrationBuilder.AddCheckConstraint(name: $"ck_{to}_weekday", table: to, sql: Weekdays);
        }
    }
}
