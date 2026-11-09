using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class GroupToneHex : Migration
    {
        private const string HexByName =
            "('Clay', '#A0522B'), ('Olive', '#676C1D'), ('Lime', '#43741F'), ('Fern', '#207823'), "
            + "('Teal', '#1F7565'), ('Indigo', '#3F5FCC'), ('Iris', '#6E50D1'), "
            + "('Violet', '#9C35C8'), ('Orchid', '#B12F9C'), ('Rose', '#BA3264')";

        private static string NameToHex(string table) =>
            $"""
                UPDATE "{table}" AS target SET tone = palette.hex
                FROM (VALUES {HexByName}) AS palette(name, hex)
                WHERE target.tone = palette.name;
                """;

        private static string HexToName(string table) =>
            $"""
                UPDATE "{table}" AS target
                SET tone = (SELECT palette.name FROM (VALUES {HexByName}) AS palette(name, hex)
                            WHERE palette.hex = target.tone)
                WHERE target.tone IS NOT NULL;
                """;

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(name: "ck_role_tone", table: "role");

            migrationBuilder.DropCheckConstraint(name: "ck_group_tone", table: "group");

            migrationBuilder.Sql(NameToHex("role"));
            migrationBuilder.Sql(NameToHex("group"));

            migrationBuilder.AlterColumn<string>(
                name: "tone",
                table: "role",
                type: "character varying(7)",
                maxLength: 7,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(32)",
                oldMaxLength: 32,
                oldNullable: true
            );

            migrationBuilder.AlterColumn<string>(
                name: "tone",
                table: "group",
                type: "character varying(7)",
                maxLength: 7,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(32)",
                oldMaxLength: 32,
                oldNullable: true
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_role_tone",
                table: "role",
                sql: "tone IS NULL OR tone ~ '^#[0-9A-F]{6}$'"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_group_tone",
                table: "group",
                sql: "tone IS NULL OR tone ~ '^#[0-9A-F]{6}$'"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(name: "ck_role_tone", table: "role");

            migrationBuilder.DropCheckConstraint(name: "ck_group_tone", table: "group");

            migrationBuilder.AlterColumn<string>(
                name: "tone",
                table: "role",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(7)",
                oldMaxLength: 7,
                oldNullable: true
            );

            migrationBuilder.AlterColumn<string>(
                name: "tone",
                table: "group",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(7)",
                oldMaxLength: 7,
                oldNullable: true
            );

            migrationBuilder.Sql(HexToName("role"));
            migrationBuilder.Sql("UPDATE \"role\" SET icon = NULL WHERE tone IS NULL;");
            migrationBuilder.Sql(HexToName("group"));

            migrationBuilder.AddCheckConstraint(
                name: "ck_role_tone",
                table: "role",
                sql: "tone IS NULL OR tone IN ('Clay', 'Olive', 'Lime', 'Fern', 'Teal', 'Indigo', 'Iris', 'Violet', 'Orchid', 'Rose')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_group_tone",
                table: "group",
                sql: "tone IS NULL OR tone IN ('Clay', 'Olive', 'Lime', 'Fern', 'Teal', 'Indigo', 'Iris', 'Violet', 'Orchid', 'Rose')"
            );
        }
    }
}
