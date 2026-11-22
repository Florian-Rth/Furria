using System;
using Furria.Infrastructure.Changes;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class WhatsAppGroupKeeping : Migration
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

            migrationBuilder.AddColumn<bool>(
                name: "club_group_consent",
                table: "person",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );

            migrationBuilder.AddColumn<string>(
                name: "invite_link",
                table: "linked_whatsapp_group",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true
            );

            migrationBuilder.AddColumn<bool>(
                name: "keeps_members",
                table: "linked_whatsapp_group",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );

            migrationBuilder.AddColumn<bool>(
                name: "club_group_consent",
                table: "intake",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );

            migrationBuilder.CreateTable(
                name: "whatsapp_group_add",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    chat_id = table.Column<string>(
                        type: "character varying(128)",
                        maxLength: 128,
                        nullable: false
                    ),
                    person_id = table.Column<int>(type: "integer", nullable: false),
                    phone_digits = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    state = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    changed_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_whatsapp_group_add", x => x.id);
                    table.CheckConstraint(
                        "ck_whatsapp_group_add_phone_digits",
                        "phone_digits ~ '^[0-9]{8,15}$'"
                    );
                    table.CheckConstraint(
                        "ck_whatsapp_group_add_state",
                        "state IN ('Requested', 'InGroup', 'Refused')"
                    );
                    table.ForeignKey(
                        name: "fk_whatsapp_group_add_person_person_id",
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
                sql: "operation IN ('PostText', 'EditText', 'Reply', 'Delete', 'AddParticipant') OR add_on_kind IS NOT NULL"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_host_kind",
                table: "outbox_whatsapp",
                sql: "host_kind IN ('Announcement', 'CalendarEntry', 'Person')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_operation",
                table: "outbox_whatsapp",
                sql: "operation IN ('PostText', 'SendPoll', 'SendEvent', 'EditText', 'Reply', 'Delete', 'AddParticipant')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_person_add",
                table: "outbox_whatsapp",
                sql: "(operation = 'AddParticipant') = (host_kind = 'Person')"
            );

            migrationBuilder.CreateIndex(
                name: "ix_whatsapp_group_add_chat_id_person_id",
                table: "whatsapp_group_add",
                columns: new[] { "chat_id", "person_id" },
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_whatsapp_group_add_person_id",
                table: "whatsapp_group_add",
                column: "person_id"
            );

            migrationBuilder.NotifyChangesOf("whatsapp_group_add");
            migrationBuilder.NotifyChangesOf("whatsapp_answer");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.StopNotifyingChangesOf("whatsapp_answer");
            migrationBuilder.Sql(
                "DELETE FROM outbox_whatsapp WHERE operation = 'AddParticipant' OR host_kind = 'Person';"
            );

            migrationBuilder.DropTable(name: "whatsapp_group_add");

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
                name: "ck_outbox_whatsapp_person_add",
                table: "outbox_whatsapp"
            );

            migrationBuilder.DropColumn(name: "club_group_consent", table: "person");

            migrationBuilder.DropColumn(name: "invite_link", table: "linked_whatsapp_group");

            migrationBuilder.DropColumn(name: "keeps_members", table: "linked_whatsapp_group");

            migrationBuilder.DropColumn(name: "club_group_consent", table: "intake");

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_add_on_operation",
                table: "outbox_whatsapp",
                sql: "operation IN ('PostText', 'EditText', 'Reply', 'Delete') OR add_on_kind IS NOT NULL"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_host_kind",
                table: "outbox_whatsapp",
                sql: "host_kind IN ('Announcement', 'CalendarEntry')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_outbox_whatsapp_operation",
                table: "outbox_whatsapp",
                sql: "operation IN ('PostText', 'SendPoll', 'SendEvent', 'EditText', 'Reply', 'Delete')"
            );
        }
    }
}
