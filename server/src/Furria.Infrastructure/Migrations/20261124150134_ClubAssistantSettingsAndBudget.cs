using System;
using Furria.Infrastructure.Changes;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ClubAssistantSettingsAndBudget : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "club_assistant_model_call",
                columns: table => new
                {
                    id = table
                        .Column<long>(type: "bigint", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    called_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    input_tokens = table.Column<int>(type: "integer", nullable: false),
                    cached_input_tokens = table.Column<int>(type: "integer", nullable: false),
                    output_tokens = table.Column<int>(type: "integer", nullable: false),
                    cost_euros = table.Column<decimal>(
                        type: "numeric(12,6)",
                        precision: 12,
                        scale: 6,
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_club_assistant_model_call", x => x.id);
                    table.CheckConstraint(
                        "ck_club_assistant_model_call_counts",
                        "input_tokens >= 0 AND cached_input_tokens >= 0 AND output_tokens >= 0 AND cost_euros >= 0"
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "club_assistant_settings",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false),
                    is_enabled = table.Column<bool>(
                        type: "boolean",
                        nullable: false,
                        defaultValue: false
                    ),
                    monthly_budget_euros = table.Column<decimal>(
                        type: "numeric(8,2)",
                        precision: 8,
                        scale: 2,
                        nullable: false
                    ),
                    questions_per_person_per_day = table.Column<int>(
                        type: "integer",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_club_assistant_settings", x => x.id);
                    table.CheckConstraint(
                        "ck_club_assistant_settings_monthly_budget",
                        "monthly_budget_euros BETWEEN 0 AND 1000"
                    );
                    table.CheckConstraint(
                        "ck_club_assistant_settings_questions_per_person_per_day",
                        "questions_per_person_per_day BETWEEN 1 AND 500"
                    );
                    table.CheckConstraint("ck_club_assistant_settings_single", "id = 1");
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_club_assistant_model_call_called_at",
                table: "club_assistant_model_call",
                column: "called_at"
            );

            migrationBuilder.NotifyChangesOf("club_assistant_settings");
            migrationBuilder.NotifyChangesOf("club_assistant_model_call");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "club_assistant_model_call");

            migrationBuilder.DropTable(name: "club_assistant_settings");
        }
    }
}
