using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PortraitsAndGroupPictures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "portrait_url", table: "person");

            migrationBuilder.AddColumn<int>(
                name: "portrait_id",
                table: "person",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "rendered_at",
                table: "media_item",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "picture_id",
                table: "group",
                type: "integer",
                nullable: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_person_portrait_id",
                table: "person",
                column: "portrait_id",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_group_picture_id",
                table: "group",
                column: "picture_id",
                unique: true
            );

            migrationBuilder.AddForeignKey(
                name: "fk_group_media_item_picture_id",
                table: "group",
                column: "picture_id",
                principalTable: "media_item",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull
            );

            migrationBuilder.AddForeignKey(
                name: "fk_person_media_item_portrait_id",
                table: "person",
                column: "portrait_id",
                principalTable: "media_item",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(name: "fk_group_media_item_picture_id", table: "group");

            migrationBuilder.DropForeignKey(
                name: "fk_person_media_item_portrait_id",
                table: "person"
            );

            migrationBuilder.DropIndex(name: "ix_person_portrait_id", table: "person");

            migrationBuilder.DropIndex(name: "ix_group_picture_id", table: "group");

            migrationBuilder.DropColumn(name: "portrait_id", table: "person");

            migrationBuilder.DropColumn(name: "rendered_at", table: "media_item");

            migrationBuilder.DropColumn(name: "picture_id", table: "group");

            migrationBuilder.AddColumn<string>(
                name: "portrait_url",
                table: "person",
                type: "character varying(512)",
                maxLength: 512,
                nullable: true
            );
        }
    }
}
