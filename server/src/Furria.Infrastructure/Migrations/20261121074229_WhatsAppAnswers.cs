using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class WhatsAppAnswers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "message_key",
                table: "whatsapp_message",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.Sql(
                """
                UPDATE whatsapp_message
                SET message_key = CASE
                    WHEN array_length(string_to_array(message_id, '_'), 1) > 2
                        THEN split_part(message_id, '_', 3)
                    ELSE message_id
                END
                """
            );
            migrationBuilder.Sql(
                "ALTER TABLE whatsapp_message ALTER COLUMN message_key DROP DEFAULT"
            );

            migrationBuilder.AddColumn<bool>(
                name: "is_given_through_whatsapp",
                table: "poll_vote",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );

            migrationBuilder.AddColumn<bool>(
                name: "is_given_through_whatsapp",
                table: "attendance_response",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );

            migrationBuilder.CreateTable(
                name: "whatsapp_answer",
                columns: table => new
                {
                    id = table
                        .Column<long>(type: "bigint", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    whatsapp_message_id = table.Column<long>(type: "bigint", nullable: false),
                    sender_id = table.Column<string>(
                        type: "character varying(128)",
                        maxLength: 128,
                        nullable: false
                    ),
                    sender_name = table.Column<string>(
                        type: "character varying(128)",
                        maxLength: 128,
                        nullable: true
                    ),
                    sender_phone = table.Column<string>(
                        type: "character varying(16)",
                        maxLength: 16,
                        nullable: true
                    ),
                    person_id = table.Column<int>(type: "integer", nullable: true),
                    poll_option_ids = table.Column<List<int>>(
                        type: "integer[]",
                        nullable: false,
                        defaultValueSql: "'{}'"
                    ),
                    attendance = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: true
                    ),
                    answered_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_whatsapp_answer", x => x.id);
                    table.CheckConstraint(
                        "ck_whatsapp_answer_attendance",
                        "attendance IN ('Yes', 'No', 'Maybe')"
                    );
                    table.ForeignKey(
                        name: "fk_whatsapp_answer_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_whatsapp_answer_whatsapp_message_whatsapp_message_id",
                        column: x => x.whatsapp_message_id,
                        principalTable: "whatsapp_message",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_whatsapp_message_message_key",
                table: "whatsapp_message",
                column: "message_key"
            );

            migrationBuilder.CreateIndex(
                name: "ix_whatsapp_answer_person_id",
                table: "whatsapp_answer",
                column: "person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_whatsapp_answer_whatsapp_message_id_sender_id",
                table: "whatsapp_answer",
                columns: new[] { "whatsapp_message_id", "sender_id" },
                unique: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "whatsapp_answer");

            migrationBuilder.DropIndex(
                name: "ix_whatsapp_message_message_key",
                table: "whatsapp_message"
            );

            migrationBuilder.DropColumn(name: "message_key", table: "whatsapp_message");

            migrationBuilder.DropColumn(name: "is_given_through_whatsapp", table: "poll_vote");

            migrationBuilder.DropColumn(
                name: "is_given_through_whatsapp",
                table: "attendance_response"
            );
        }
    }
}
