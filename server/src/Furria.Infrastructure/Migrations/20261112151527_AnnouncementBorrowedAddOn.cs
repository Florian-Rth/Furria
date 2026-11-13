using Furria.Infrastructure.Changes;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AnnouncementBorrowedAddOn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "announcement_borrowed_add_on",
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
                    calendar_entry_id = table.Column<int>(type: "integer", nullable: false),
                    poll_id = table.Column<int>(type: "integer", nullable: true),
                    sign_up_list_id = table.Column<int>(type: "integer", nullable: true),
                    position = table.Column<int>(type: "integer", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_announcement_borrowed_add_on", x => x.id);
                    table.CheckConstraint(
                        "ck_announcement_borrowed_add_on_kind_matches_target",
                        "(kind = 'Attendance' AND poll_id IS NULL AND sign_up_list_id IS NULL) OR (kind = 'Poll' AND poll_id IS NOT NULL AND sign_up_list_id IS NULL) OR (kind = 'SignUpList' AND sign_up_list_id IS NOT NULL AND poll_id IS NULL)"
                    );
                    table.CheckConstraint(
                        "ck_announcement_borrowed_add_on_position_not_negative",
                        "position >= 0"
                    );
                    table.ForeignKey(
                        name: "fk_announcement_borrowed_add_on_announcement_announcement_id",
                        column: x => x.announcement_id,
                        principalTable: "announcement",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_announcement_borrowed_add_on_entry_calendar_entry_id",
                        column: x => x.calendar_entry_id,
                        principalTable: "calendar_entry",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_announcement_borrowed_add_on_poll_poll_id",
                        column: x => x.poll_id,
                        principalTable: "poll",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_announcement_borrowed_add_on_sign_up_list_sign_up_list_id",
                        column: x => x.sign_up_list_id,
                        principalTable: "sign_up_list",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_announcement_borrowed_add_on_announcement_id_calendar_entry",
                table: "announcement_borrowed_add_on",
                columns: new[] { "announcement_id", "calendar_entry_id" },
                unique: true,
                filter: "kind = 'Attendance'"
            );

            migrationBuilder.CreateIndex(
                name: "ix_announcement_borrowed_add_on_announcement_id_poll_id",
                table: "announcement_borrowed_add_on",
                columns: new[] { "announcement_id", "poll_id" },
                unique: true,
                filter: "poll_id IS NOT NULL"
            );

            migrationBuilder.CreateIndex(
                name: "ix_announcement_borrowed_add_on_announcement_id_sign_up_list_id",
                table: "announcement_borrowed_add_on",
                columns: new[] { "announcement_id", "sign_up_list_id" },
                unique: true,
                filter: "sign_up_list_id IS NOT NULL"
            );

            migrationBuilder.CreateIndex(
                name: "ix_announcement_borrowed_add_on_calendar_entry_id",
                table: "announcement_borrowed_add_on",
                column: "calendar_entry_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_announcement_borrowed_add_on_poll_id",
                table: "announcement_borrowed_add_on",
                column: "poll_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_announcement_borrowed_add_on_sign_up_list_id",
                table: "announcement_borrowed_add_on",
                column: "sign_up_list_id"
            );

            migrationBuilder.NotifyChangesOf("announcement_borrowed_add_on");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "announcement_borrowed_add_on");
        }
    }
}
