using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PushSubscriptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "push_subscription",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    account_id = table.Column<int>(type: "integer", nullable: false),
                    endpoint = table.Column<string>(
                        type: "character varying(2048)",
                        maxLength: 2048,
                        nullable: false
                    ),
                    public_key = table.Column<string>(
                        type: "character varying(87)",
                        maxLength: 87,
                        nullable: false
                    ),
                    auth_secret = table.Column<string>(
                        type: "character varying(22)",
                        maxLength: 22,
                        nullable: false
                    ),
                    subscribed_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_push_subscription", x => x.id);
                    table.CheckConstraint(
                        "ck_push_subscription_auth_secret",
                        "length(auth_secret) = 22"
                    );
                    table.CheckConstraint(
                        "ck_push_subscription_endpoint",
                        "endpoint LIKE 'https://%'"
                    );
                    table.CheckConstraint(
                        "ck_push_subscription_public_key",
                        "length(public_key) = 87"
                    );
                    table.ForeignKey(
                        name: "fk_push_subscription_account_account_id",
                        column: x => x.account_id,
                        principalTable: "account",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_push_subscription_account_id",
                table: "push_subscription",
                column: "account_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_push_subscription_endpoint",
                table: "push_subscription",
                column: "endpoint",
                unique: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "push_subscription");
        }
    }
}
