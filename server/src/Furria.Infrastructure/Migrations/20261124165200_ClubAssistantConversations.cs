using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ClubAssistantConversations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_whatsapp_add_on_operation",
                table: "outbox_whatsapp"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_whatsapp_host_kind",
                table: "outbox_whatsapp"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_whatsapp_operation",
                table: "outbox_whatsapp"
            );

            migrationBuilder.CreateTable(
                name: "club_assistant_notice",
                columns: table => new
                {
                    chat_id = table.Column<string>(
                        type: "character varying(128)",
                        maxLength: 128,
                        nullable: false
                    ),
                    kind = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    told_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_club_assistant_notice", x => new { x.chat_id, x.kind });
                    table.CheckConstraint(
                        "ck_club_assistant_notice_kind",
                        "kind IN ('UnknownSender', 'SwitchedOff', 'NotText', 'DailyLimitReached', 'BudgetUsedUp')"
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "club_assistant_question",
                columns: table => new
                {
                    id = table
                        .Column<long>(type: "bigint", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    person_id = table.Column<int>(type: "integer", nullable: false),
                    chat_id = table.Column<string>(
                        type: "character varying(128)",
                        maxLength: 128,
                        nullable: false
                    ),
                    text = table.Column<string>(
                        type: "character varying(2000)",
                        maxLength: 2000,
                        nullable: false
                    ),
                    asked_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    last_message_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    answer = table.Column<string>(
                        type: "character varying(4000)",
                        maxLength: 4000,
                        nullable: true
                    ),
                    answered_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_club_assistant_question", x => x.id);
                    table.CheckConstraint(
                        "ck_club_assistant_question_answer",
                        "(answer IS NULL) = (answered_at IS NULL)"
                    );
                    table.CheckConstraint(
                        "ck_club_assistant_question_last_message",
                        "last_message_at >= asked_at"
                    );
                    table.ForeignKey(
                        name: "fk_club_assistant_question_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_add_on_operation",
                table: "outbox_whatsapp",
                sql: "operation IN ('PostText', 'EditText', 'Reply', 'Delete', 'AddParticipant', 'DirectText', 'PrivateReply') OR add_on_kind IS NOT NULL"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_host_kind",
                table: "outbox_whatsapp",
                sql: "host_kind IN ('Announcement', 'CalendarEntry', 'Person', 'ClubAssistant')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_operation",
                table: "outbox_whatsapp",
                sql: "operation IN ('PostText', 'SendPoll', 'SendEvent', 'EditText', 'Reply', 'Delete', 'AddParticipant', 'DirectText', 'PrivateReply')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_private_reply",
                table: "outbox_whatsapp",
                sql: "(operation = 'PrivateReply') = (host_kind = 'ClubAssistant')"
            );

            migrationBuilder.CreateIndex(
                name: "ix_club_assistant_question_asked_at",
                table: "club_assistant_question",
                column: "asked_at"
            );

            migrationBuilder.CreateIndex(
                name: "ix_club_assistant_question_person_id_asked_at",
                table: "club_assistant_question",
                columns: new[] { "person_id", "asked_at" }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM outbox_whatsapp WHERE operation = 'PrivateReply'");

            migrationBuilder.DropTable(name: "club_assistant_notice");

            migrationBuilder.DropTable(name: "club_assistant_question");

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_whatsapp_add_on_operation",
                table: "outbox_whatsapp"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_whatsapp_host_kind",
                table: "outbox_whatsapp"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_whatsapp_operation",
                table: "outbox_whatsapp"
            );

            migrationBuilder.DropCheckConstraint(
                name: "ck_outbox_whatsapp_private_reply",
                table: "outbox_whatsapp"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_add_on_operation",
                table: "outbox_whatsapp",
                sql: "operation IN ('PostText', 'EditText', 'Reply', 'Delete', 'AddParticipant', 'DirectText') OR add_on_kind IS NOT NULL"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_host_kind",
                table: "outbox_whatsapp",
                sql: "host_kind IN ('Announcement', 'CalendarEntry', 'Person')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_operation",
                table: "outbox_whatsapp",
                sql: "operation IN ('PostText', 'SendPoll', 'SendEvent', 'EditText', 'Reply', 'Delete', 'AddParticipant', 'DirectText')"
            );
        }
    }
}
