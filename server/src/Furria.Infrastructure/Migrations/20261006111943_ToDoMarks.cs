using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ToDoMarks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "to_do_mark",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    account_id = table.Column<int>(type: "integer", nullable: false),
                    kind = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    seen_subjects = table.Column<string[]>(type: "text[]", nullable: false),
                    seen_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_to_do_mark", x => x.id);
                    table.CheckConstraint(
                        "ck_to_do_mark_kind",
                        "kind IN ('NeverInvited', 'ReminderDue', 'InPersonOnly', 'BirthDateUnknown', 'KeyToTakeBack', 'ClubRecordGap', 'ApplicationWaiting')"
                    );
                    table.ForeignKey(
                        name: "fk_to_do_mark_account_account_id",
                        column: x => x.account_id,
                        principalTable: "account",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_to_do_mark_account_id_kind",
                table: "to_do_mark",
                columns: new[] { "account_id", "kind" },
                unique: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "to_do_mark");
        }
    }
}
