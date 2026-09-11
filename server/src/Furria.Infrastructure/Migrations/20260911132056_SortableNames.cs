using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SortableNames : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "name",
                table: "role",
                type: "character varying(80)",
                maxLength: 80,
                nullable: false,
                collation: "de-DE-x-icu",
                oldClrType: typeof(string),
                oldType: "character varying(80)",
                oldMaxLength: 80
            );

            migrationBuilder.AlterColumn<string>(
                name: "last_name",
                table: "person",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                collation: "de-DE-x-icu",
                oldClrType: typeof(string),
                oldType: "character varying(128)",
                oldMaxLength: 128
            );

            migrationBuilder.AlterColumn<string>(
                name: "first_name",
                table: "person",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                collation: "de-DE-x-icu",
                oldClrType: typeof(string),
                oldType: "character varying(128)",
                oldMaxLength: 128
            );

            migrationBuilder.AlterColumn<string>(
                name: "name",
                table: "group",
                type: "character varying(80)",
                maxLength: 80,
                nullable: false,
                collation: "de-DE-x-icu",
                oldClrType: typeof(string),
                oldType: "character varying(80)",
                oldMaxLength: 80
            );

            migrationBuilder.CreateIndex(
                name: "ix_role_holding_role_id_person_id",
                table: "role_holding",
                columns: new[] { "role_id", "person_id" }
            );

            migrationBuilder.CreateIndex(
                name: "ix_group_admin_group_id_person_id",
                table: "group_admin",
                columns: new[] { "group_id", "person_id" }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_role_holding_role_id_person_id",
                table: "role_holding"
            );

            migrationBuilder.DropIndex(
                name: "ix_group_admin_group_id_person_id",
                table: "group_admin"
            );

            migrationBuilder.AlterColumn<string>(
                name: "name",
                table: "role",
                type: "character varying(80)",
                maxLength: 80,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(80)",
                oldMaxLength: 80,
                oldCollation: "de-DE-x-icu"
            );

            migrationBuilder.AlterColumn<string>(
                name: "last_name",
                table: "person",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(128)",
                oldMaxLength: 128,
                oldCollation: "de-DE-x-icu"
            );

            migrationBuilder.AlterColumn<string>(
                name: "first_name",
                table: "person",
                type: "character varying(128)",
                maxLength: 128,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(128)",
                oldMaxLength: 128,
                oldCollation: "de-DE-x-icu"
            );

            migrationBuilder.AlterColumn<string>(
                name: "name",
                table: "group",
                type: "character varying(80)",
                maxLength: 80,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(80)",
                oldMaxLength: 80,
                oldCollation: "de-DE-x-icu"
            );
        }
    }
}
