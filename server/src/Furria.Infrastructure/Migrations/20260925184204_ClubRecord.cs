using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ClubRecord : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "club_record",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(
                        type: "character varying(160)",
                        maxLength: 160,
                        nullable: true
                    ),
                    short_name = table.Column<string>(
                        type: "character varying(40)",
                        maxLength: 40,
                        nullable: true
                    ),
                    founded_year = table.Column<int>(type: "integer", nullable: true),
                    street = table.Column<string>(
                        type: "character varying(120)",
                        maxLength: 120,
                        nullable: true
                    ),
                    zip = table.Column<string>(
                        type: "character varying(16)",
                        maxLength: 16,
                        nullable: true
                    ),
                    city = table.Column<string>(
                        type: "character varying(80)",
                        maxLength: 80,
                        nullable: true
                    ),
                    email = table.Column<string>(
                        type: "character varying(256)",
                        maxLength: 256,
                        nullable: true
                    ),
                    phone = table.Column<string>(
                        type: "character varying(64)",
                        maxLength: 64,
                        nullable: true
                    ),
                    website_url = table.Column<string>(
                        type: "character varying(256)",
                        maxLength: 256,
                        nullable: true
                    ),
                    instagram_url = table.Column<string>(
                        type: "character varying(256)",
                        maxLength: 256,
                        nullable: true
                    ),
                    facebook_url = table.Column<string>(
                        type: "character varying(256)",
                        maxLength: 256,
                        nullable: true
                    ),
                    age_of_consent = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false,
                        defaultValueSql: "now()"
                    ),
                    updated_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false,
                        defaultValueSql: "now()"
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_club_record", x => x.id);
                    table.CheckConstraint(
                        "ck_club_record_age_of_consent",
                        "age_of_consent BETWEEN 12 AND 21"
                    );
                    table.CheckConstraint(
                        "ck_club_record_founded_year",
                        "founded_year IS NULL OR founded_year >= 1800"
                    );
                    table.CheckConstraint("ck_club_record_single", "id = 1");
                }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "club_record");
        }
    }
}
