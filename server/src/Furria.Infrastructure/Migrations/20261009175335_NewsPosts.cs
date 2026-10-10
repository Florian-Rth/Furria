using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class NewsPosts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "news_post",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    title = table.Column<string>(
                        type: "character varying(120)",
                        maxLength: 120,
                        nullable: false
                    ),
                    teaser = table.Column<string>(
                        type: "character varying(300)",
                        maxLength: 300,
                        nullable: false
                    ),
                    text = table.Column<string>(
                        type: "character varying(20000)",
                        maxLength: 20000,
                        nullable: false
                    ),
                    category = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: true
                    ),
                    event_id = table.Column<int>(type: "integer", nullable: true),
                    album_id = table.Column<int>(type: "integer", nullable: true),
                    pending_saved_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    pending_title = table.Column<string>(
                        type: "character varying(120)",
                        maxLength: 120,
                        nullable: false
                    ),
                    pending_teaser = table.Column<string>(
                        type: "character varying(300)",
                        maxLength: 300,
                        nullable: false
                    ),
                    pending_text = table.Column<string>(
                        type: "character varying(20000)",
                        maxLength: 20000,
                        nullable: false
                    ),
                    pending_category = table.Column<string>(
                        type: "character varying(32)",
                        maxLength: 32,
                        nullable: true
                    ),
                    pending_event_id = table.Column<int>(type: "integer", nullable: true),
                    pending_album_id = table.Column<int>(type: "integer", nullable: true),
                    author_person_id = table.Column<int>(type: "integer", nullable: true),
                    slug = table.Column<string>(
                        type: "character varying(92)",
                        maxLength: 92,
                        nullable: true
                    ),
                    published_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    withdrawn_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    revision = table.Column<int>(type: "integer", nullable: false),
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
                    table.PrimaryKey("pk_news_post", x => x.id);
                    table.CheckConstraint(
                        "ck_news_post_category",
                        "category IS NULL OR category IN ('Session', 'Achievements', 'Club', 'Groups')"
                    );
                    table.CheckConstraint(
                        "ck_news_post_pending",
                        "pending_saved_at IS NULL OR (published_at IS NOT NULL AND withdrawn_at IS NULL)"
                    );
                    table.CheckConstraint(
                        "ck_news_post_pending_category",
                        "pending_category IS NULL OR pending_category IN ('Session', 'Achievements', 'Club', 'Groups')"
                    );
                    table.CheckConstraint(
                        "ck_news_post_published",
                        "(published_at IS NULL) = (slug IS NULL)"
                    );
                    table.CheckConstraint(
                        "ck_news_post_withdrawn",
                        "withdrawn_at IS NULL OR published_at IS NOT NULL"
                    );
                    table.ForeignKey(
                        name: "fk_news_post_album_album_id",
                        column: x => x.album_id,
                        principalTable: "album",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                    table.ForeignKey(
                        name: "fk_news_post_album_pending_album_id",
                        column: x => x.pending_album_id,
                        principalTable: "album",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                    table.ForeignKey(
                        name: "fk_news_post_event_event_id",
                        column: x => x.event_id,
                        principalTable: "event",
                        principalColumn: "calendar_entry_id",
                        onDelete: ReferentialAction.SetNull
                    );
                    table.ForeignKey(
                        name: "fk_news_post_event_pending_event_id",
                        column: x => x.pending_event_id,
                        principalTable: "event",
                        principalColumn: "calendar_entry_id",
                        onDelete: ReferentialAction.SetNull
                    );
                    table.ForeignKey(
                        name: "fk_news_post_person_author_person_id",
                        column: x => x.author_person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "news_post_mention",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    news_post_id = table.Column<int>(type: "integer", nullable: false),
                    group_id = table.Column<int>(type: "integer", nullable: true),
                    person_id = table.Column<int>(type: "integer", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_news_post_mention", x => x.id);
                    table.CheckConstraint(
                        "ck_news_post_mention_one_target",
                        "(group_id IS NULL) <> (person_id IS NULL)"
                    );
                    table.ForeignKey(
                        name: "fk_news_post_mention_group_group_id",
                        column: x => x.group_id,
                        principalTable: "group",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_news_post_mention_news_post_news_post_id",
                        column: x => x.news_post_id,
                        principalTable: "news_post",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_news_post_mention_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "ix_news_post_album_id",
                table: "news_post",
                column: "album_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_news_post_author_person_id",
                table: "news_post",
                column: "author_person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_news_post_event_id",
                table: "news_post",
                column: "event_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_news_post_pending_album_id",
                table: "news_post",
                column: "pending_album_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_news_post_pending_event_id",
                table: "news_post",
                column: "pending_event_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_news_post_published_at",
                table: "news_post",
                column: "published_at"
            );

            migrationBuilder.CreateIndex(
                name: "ix_news_post_slug",
                table: "news_post",
                column: "slug",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_news_post_mention_group_id",
                table: "news_post_mention",
                column: "group_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_news_post_mention_news_post_id_group_id",
                table: "news_post_mention",
                columns: new[] { "news_post_id", "group_id" },
                unique: true,
                filter: "group_id IS NOT NULL"
            );

            migrationBuilder.CreateIndex(
                name: "ix_news_post_mention_news_post_id_person_id",
                table: "news_post_mention",
                columns: new[] { "news_post_id", "person_id" },
                unique: true,
                filter: "person_id IS NOT NULL"
            );

            migrationBuilder.CreateIndex(
                name: "ix_news_post_mention_person_id",
                table: "news_post_mention",
                column: "person_id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "news_post_mention");

            migrationBuilder.DropTable(name: "news_post");
        }
    }
}
