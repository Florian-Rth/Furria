using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class StudioDataAndStage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "stage_artwork_svg",
                table: "club_record",
                type: "character varying(500000)",
                maxLength: 500000,
                nullable: true
            );

            migrationBuilder.AddColumn<decimal>(
                name: "stage_depth_metres",
                table: "club_record",
                type: "numeric(4,2)",
                precision: 4,
                scale: 2,
                nullable: true
            );

            migrationBuilder.AddColumn<decimal>(
                name: "stage_width_metres",
                table: "club_record",
                type: "numeric(4,2)",
                precision: 4,
                scale: 2,
                nullable: true
            );

            migrationBuilder.CreateTable(
                name: "act_co_editor",
                columns: table => new
                {
                    act_id = table.Column<int>(type: "integer", nullable: false),
                    person_id = table.Column<int>(type: "integer", nullable: false),
                    granted_by_person_id = table.Column<int>(type: "integer", nullable: true),
                    granted_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: false,
                        defaultValueSql: "now()"
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_act_co_editor", x => new { x.act_id, x.person_id });
                    table.ForeignKey(
                        name: "fk_act_co_editor_act_act_id",
                        column: x => x.act_id,
                        principalTable: "act",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_act_co_editor_person_granted_by_person_id",
                        column: x => x.granted_by_person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                    table.ForeignKey(
                        name: "fk_act_co_editor_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "act_final_track",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    act_id = table.Column<int>(type: "integer", nullable: false),
                    media_item_id = table.Column<int>(type: "integer", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false),
                    adopted_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                    first_beat_seconds = table.Column<double>(
                        type: "double precision",
                        nullable: true
                    ),
                    tempo_bpm = table.Column<double>(type: "double precision", nullable: true),
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
                    table.PrimaryKey("pk_act_final_track", x => x.id);
                    table.CheckConstraint(
                        "ck_act_final_track_beat_grid",
                        "(first_beat_seconds IS NULL OR first_beat_seconds >= 0) AND (tempo_bpm IS NULL OR tempo_bpm > 0)"
                    );
                    table.CheckConstraint("ck_act_final_track_version", "version >= 1");
                    table.ForeignKey(
                        name: "fk_act_final_track_act_act_id",
                        column: x => x.act_id,
                        principalTable: "act",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_act_final_track_media_item_media_item_id",
                        column: x => x.media_item_id,
                        principalTable: "media_item",
                        principalColumn: "id"
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "act_song",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    act_id = table.Column<int>(type: "integer", nullable: false),
                    media_item_id = table.Column<int>(type: "integer", nullable: false),
                    position = table.Column<int>(type: "integer", nullable: false),
                    start_seconds = table.Column<double>(type: "double precision", nullable: false),
                    end_seconds = table.Column<double>(type: "double precision", nullable: true),
                    first_beat_seconds = table.Column<double>(
                        type: "double precision",
                        nullable: true
                    ),
                    tempo_bpm = table.Column<double>(type: "double precision", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_act_song", x => x.id);
                    table.CheckConstraint(
                        "ck_act_song_beat_grid",
                        "(first_beat_seconds IS NULL OR first_beat_seconds >= 0) AND (tempo_bpm IS NULL OR tempo_bpm > 0)"
                    );
                    table.CheckConstraint(
                        "ck_act_song_cut",
                        "start_seconds >= 0 AND (end_seconds IS NULL OR end_seconds > start_seconds)"
                    );
                    table.CheckConstraint("ck_act_song_position", "position >= 0");
                    table.ForeignKey(
                        name: "fk_act_song_act_act_id",
                        column: x => x.act_id,
                        principalTable: "act",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_act_song_media_item_media_item_id",
                        column: x => x.media_item_id,
                        principalTable: "media_item",
                        principalColumn: "id"
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "act_step",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    act_id = table.Column<int>(type: "integer", nullable: false),
                    start_source_media_item_id = table.Column<int>(
                        type: "integer",
                        nullable: false
                    ),
                    start_seconds = table.Column<double>(type: "double precision", nullable: false),
                    name = table.Column<string>(
                        type: "character varying(80)",
                        maxLength: 80,
                        nullable: false
                    ),
                    description = table.Column<string>(
                        type: "character varying(2000)",
                        maxLength: 2000,
                        nullable: true
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_act_step", x => x.id);
                    table.CheckConstraint("ck_act_step_start", "start_seconds >= 0");
                    table.ForeignKey(
                        name: "fk_act_step_act_act_id",
                        column: x => x.act_id,
                        principalTable: "act",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_act_step_media_item_start_source_media_item_id",
                        column: x => x.start_source_media_item_id,
                        principalTable: "media_item",
                        principalColumn: "id"
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "act_video",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    act_id = table.Column<int>(type: "integer", nullable: false),
                    media_item_id = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(
                        type: "character varying(80)",
                        maxLength: 80,
                        nullable: true
                    ),
                    start_source_media_item_id = table.Column<int>(type: "integer", nullable: true),
                    start_seconds = table.Column<double>(type: "double precision", nullable: true),
                    outdated_at = table.Column<DateTimeOffset>(
                        type: "timestamp with time zone",
                        nullable: true
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_act_video", x => x.id);
                    table.CheckConstraint(
                        "ck_act_video_start",
                        "(start_source_media_item_id IS NULL) = (start_seconds IS NULL) AND (start_seconds IS NULL OR start_seconds >= 0)"
                    );
                    table.ForeignKey(
                        name: "fk_act_video_act_act_id",
                        column: x => x.act_id,
                        principalTable: "act",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_act_video_media_item_media_item_id",
                        column: x => x.media_item_id,
                        principalTable: "media_item",
                        principalColumn: "id"
                    );
                    table.ForeignKey(
                        name: "fk_act_video_media_item_start_source_media_item_id",
                        column: x => x.start_source_media_item_id,
                        principalTable: "media_item",
                        principalColumn: "id"
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "choreography",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    act_id = table.Column<int>(type: "integer", nullable: false),
                    appearance_id = table.Column<int>(type: "integer", nullable: true),
                    document = table.Column<string>(type: "jsonb", nullable: false),
                    version = table.Column<int>(type: "integer", nullable: false),
                    copied_from_version = table.Column<int>(type: "integer", nullable: true),
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
                    table.PrimaryKey("pk_choreography", x => x.id);
                    table.CheckConstraint(
                        "ck_choreography_copied_from_version",
                        "copied_from_version IS NULL OR appearance_id IS NOT NULL"
                    );
                    table.CheckConstraint(
                        "ck_choreography_document",
                        "jsonb_typeof(document) = 'object' AND jsonb_typeof(document -> 'tracks') = 'array'"
                    );
                    table.CheckConstraint("ck_choreography_version", "version >= 1");
                    table.ForeignKey(
                        name: "fk_choreography_act_act_id",
                        column: x => x.act_id,
                        principalTable: "act",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_choreography_appearance_appearance_id",
                        column: x => x.appearance_id,
                        principalTable: "appearance",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "spot",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    act_id = table.Column<int>(type: "integer", nullable: false),
                    number = table.Column<int>(type: "integer", nullable: false),
                    person_id = table.Column<int>(type: "integer", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_spot", x => x.id);
                    table.CheckConstraint("ck_spot_number", "number >= 1");
                    table.ForeignKey(
                        name: "fk_spot_act_act_id",
                        column: x => x.act_id,
                        principalTable: "act",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_spot_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "act_final_track_alignment",
                columns: table => new
                {
                    final_track_id = table.Column<int>(type: "integer", nullable: false),
                    source_media_item_id = table.Column<int>(type: "integer", nullable: false),
                    offset_seconds = table.Column<double>(
                        type: "double precision",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey(
                        "pk_act_final_track_alignment",
                        x => new { x.final_track_id, x.source_media_item_id }
                    );
                    table.ForeignKey(
                        name: "fk_act_final_track_alignment_act_final_track_final_track_id",
                        column: x => x.final_track_id,
                        principalTable: "act_final_track",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_act_final_track_alignment_media_item_source_media_item_id",
                        column: x => x.source_media_item_id,
                        principalTable: "media_item",
                        principalColumn: "id"
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "act_part",
                columns: table => new
                {
                    id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    act_id = table.Column<int>(type: "integer", nullable: false),
                    first_step_id = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(
                        type: "character varying(80)",
                        maxLength: 80,
                        nullable: false
                    ),
                    main_video_id = table.Column<int>(type: "integer", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_act_part", x => x.id);
                    table.ForeignKey(
                        name: "fk_act_part_act_act_id",
                        column: x => x.act_id,
                        principalTable: "act",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_act_part_act_step_first_step_id",
                        column: x => x.first_step_id,
                        principalTable: "act_step",
                        principalColumn: "id"
                    );
                    table.ForeignKey(
                        name: "fk_act_part_act_video_main_video_id",
                        column: x => x.main_video_id,
                        principalTable: "act_video",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "appearance_spot",
                columns: table => new
                {
                    appearance_id = table.Column<int>(type: "integer", nullable: false),
                    spot_id = table.Column<int>(type: "integer", nullable: false),
                    person_id = table.Column<int>(type: "integer", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_appearance_spot", x => new { x.appearance_id, x.spot_id });
                    table.ForeignKey(
                        name: "fk_appearance_spot_appearance_appearance_id",
                        column: x => x.appearance_id,
                        principalTable: "appearance",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_appearance_spot_person_person_id",
                        column: x => x.person_id,
                        principalTable: "person",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "fk_appearance_spot_spot_spot_id",
                        column: x => x.spot_id,
                        principalTable: "spot",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_club_record_stage_size",
                table: "club_record",
                sql: "(stage_width_metres IS NULL AND stage_depth_metres IS NULL AND stage_artwork_svg IS NULL) OR (stage_width_metres IS NOT NULL AND stage_depth_metres IS NOT NULL AND stage_width_metres BETWEEN 2 AND 40 AND stage_depth_metres BETWEEN 2 AND 40)"
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_co_editor_granted_by_person_id",
                table: "act_co_editor",
                column: "granted_by_person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_co_editor_person_id",
                table: "act_co_editor",
                column: "person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_final_track_act_id_version",
                table: "act_final_track",
                columns: new[] { "act_id", "version" },
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_final_track_media_item_id",
                table: "act_final_track",
                column: "media_item_id",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_final_track_alignment_source_media_item_id",
                table: "act_final_track_alignment",
                column: "source_media_item_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_part_act_id",
                table: "act_part",
                column: "act_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_part_first_step_id",
                table: "act_part",
                column: "first_step_id",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_part_main_video_id",
                table: "act_part",
                column: "main_video_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_song_act_id",
                table: "act_song",
                column: "act_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_song_media_item_id",
                table: "act_song",
                column: "media_item_id",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_step_act_id",
                table: "act_step",
                column: "act_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_step_start_source_media_item_id",
                table: "act_step",
                column: "start_source_media_item_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_video_act_id",
                table: "act_video",
                column: "act_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_video_media_item_id",
                table: "act_video",
                column: "media_item_id",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_act_video_start_source_media_item_id",
                table: "act_video",
                column: "start_source_media_item_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_appearance_spot_person_id",
                table: "appearance_spot",
                column: "person_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_appearance_spot_spot_id",
                table: "appearance_spot",
                column: "spot_id"
            );

            migrationBuilder.CreateIndex(
                name: "ix_choreography_act_id_session",
                table: "choreography",
                column: "act_id",
                unique: true,
                filter: "appearance_id IS NULL"
            );

            migrationBuilder.CreateIndex(
                name: "ix_choreography_appearance_id",
                table: "choreography",
                column: "appearance_id",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_spot_act_id_number",
                table: "spot",
                columns: new[] { "act_id", "number" },
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_spot_act_id_person_id",
                table: "spot",
                columns: new[] { "act_id", "person_id" },
                unique: true,
                filter: "person_id IS NOT NULL"
            );

            migrationBuilder.CreateIndex(
                name: "ix_spot_person_id",
                table: "spot",
                column: "person_id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "act_co_editor");

            migrationBuilder.DropTable(name: "act_final_track_alignment");

            migrationBuilder.DropTable(name: "act_part");

            migrationBuilder.DropTable(name: "act_song");

            migrationBuilder.DropTable(name: "appearance_spot");

            migrationBuilder.DropTable(name: "choreography");

            migrationBuilder.DropTable(name: "act_final_track");

            migrationBuilder.DropTable(name: "act_step");

            migrationBuilder.DropTable(name: "act_video");

            migrationBuilder.DropTable(name: "spot");

            migrationBuilder.DropCheckConstraint(
                name: "ck_club_record_stage_size",
                table: "club_record"
            );

            migrationBuilder.DropColumn(name: "stage_artwork_svg", table: "club_record");

            migrationBuilder.DropColumn(name: "stage_depth_metres", table: "club_record");

            migrationBuilder.DropColumn(name: "stage_width_metres", table: "club_record");
        }
    }
}
