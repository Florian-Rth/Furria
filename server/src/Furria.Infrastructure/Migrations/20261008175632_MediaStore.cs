using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MediaStore : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "media_item",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    storage_key = table.Column<Guid>(type: "uuid", nullable: false),
                    owner_kind = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    owner_person_id = table.Column<int>(type: "integer", nullable: true),
                    owner_group_id = table.Column<int>(type: "integer", nullable: true),
                    kind = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    state = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: false
                    ),
                    failure_reason = table.Column<string>(
                        type: "character varying(500)",
                        maxLength: 500,
                        nullable: true
                    ),
                    original_file_name = table.Column<string>(
                        type: "character varying(255)",
                        maxLength: 255,
                        nullable: false
                    ),
                    content_type = table.Column<string>(
                        type: "character varying(64)",
                        maxLength: 64,
                        nullable: false
                    ),
                    byte_size = table.Column<long>(type: "bigint", nullable: false),
                    width = table.Column<int>(type: "integer", nullable: true),
                    height = table.Column<int>(type: "integer", nullable: true),
                    duration_seconds = table.Column<double>(
                        type: "double precision",
                        nullable: true
                    ),
                    captured_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    camera = table.Column<string>(
                        type: "character varying(120)",
                        maxLength: 120,
                        nullable: true
                    ),
                    crop_left = table.Column<double>(type: "double precision", nullable: true),
                    crop_top = table.Column<double>(type: "double precision", nullable: true),
                    crop_width = table.Column<double>(type: "double precision", nullable: true),
                    crop_height = table.Column<double>(type: "double precision", nullable: true),
                    uploaded_by_person_id = table.Column<int>(type: "integer", nullable: true),
                    uploaded_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
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
                    table.PrimaryKey("pk_media_item", x => x.id);
                    table.CheckConstraint("ck_media_item_byte_size", "byte_size > 0");
                    table.CheckConstraint("ck_media_item_kind", "kind IN ('Photo', 'Video')");
                    table.CheckConstraint(
                        "ck_media_item_owner",
                        "(owner_kind = 'Person' AND owner_person_id IS NOT NULL AND owner_group_id IS NULL)\nOR (owner_kind = 'Group' AND owner_group_id IS NOT NULL AND owner_person_id IS NULL)\nOR (owner_kind = 'Gallery' AND owner_person_id IS NULL AND owner_group_id IS NULL)"
                    );
                    table.CheckConstraint(
                        "ck_media_item_owner_kind",
                        "owner_kind IN ('Person', 'Group', 'Gallery')"
                    );
                    table.CheckConstraint(
                        "ck_media_item_state",
                        "state IN ('Processing', 'Ready', 'Failed')"
                    );
                    table.ForeignKey(
                        name: "fk_media_item_group_owner_group_id",
                        column: x => x.owner_group_id,
                        principalTable: "group",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_media_item_person_owner_person_id",
                        column: x => x.owner_person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_media_item_person_uploaded_by_person_id",
                        column: x => x.uploaded_by_person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "media_job",
                columns: table => new
                {
                    id = table
                        .Column<long>(type: "bigint", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    media_item_id = table.Column<int>(type: "integer", nullable: false),
                    enqueued_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    available_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    claimed_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    lease_id = table.Column<Guid>(type: "uuid", nullable: true),
                    lease_expires_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    attempts = table.Column<int>(type: "integer", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_media_job", x => x.id);
                    table.CheckConstraint("ck_media_job_attempts", "attempts >= 0");
                    table.CheckConstraint(
                        "ck_media_job_lease",
                        "(claimed_at IS NULL AND lease_id IS NULL AND lease_expires_at IS NULL)\nOR (claimed_at IS NOT NULL AND lease_id IS NOT NULL AND lease_expires_at IS NOT NULL)"
                    );
                    table.ForeignKey(
                        name: "fk_media_job_media_item_media_item_id",
                        column: x => x.media_item_id,
                        principalTable: "media_item",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_media_item_owner_group_id",
                table: "media_item",
                column: "owner_group_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_media_item_owner_person_id",
                table: "media_item",
                column: "owner_person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_media_item_storage_key",
                table: "media_item",
                column: "storage_key",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_media_item_uploaded_by_person_id",
                table: "media_item",
                column: "uploaded_by_person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_media_job_available_at_id",
                table: "media_job",
                columns: new[] { "available_at", "id" }
            );

            migrationBuilder.CreateIndex(
                name: "ix_media_job_media_item_id",
                table: "media_job",
                column: "media_item_id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "media_job");

            migrationBuilder.DropTable(name: "media_item");
        }
    }
}
