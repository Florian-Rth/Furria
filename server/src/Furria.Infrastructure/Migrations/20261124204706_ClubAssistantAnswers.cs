using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ClubAssistantAnswers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "club_assistant_acquaintance",
                columns: table => new
                {
                    person_id = table.Column<int>(type: "integer", nullable: false),
                    introduced_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_club_assistant_acquaintance", x => x.person_id);
                    table.ForeignKey(
                        name: "fk_club_assistant_acquaintance_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_club_assistant_question_unanswered_last_message_at",
                table: "club_assistant_question",
                column: "last_message_at",
                filter: "answered_at IS NULL"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "club_assistant_acquaintance");

            migrationBuilder.DropIndex(
                name: "ix_club_assistant_question_unanswered_last_message_at",
                table: "club_assistant_question"
            );
        }
    }
}
