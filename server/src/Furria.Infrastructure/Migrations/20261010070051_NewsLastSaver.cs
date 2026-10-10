using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class NewsLastSaver : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "last_saved_by_person_id",
                table: "news_post",
                type: "integer",
                nullable: true
            );

            migrationBuilder.CreateIndex(
                name: "ix_news_post_last_saved_by_person_id",
                table: "news_post",
                column: "last_saved_by_person_id"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_news_post_person_last_saved_by_person_id",
                table: "news_post",
                column: "last_saved_by_person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_news_post_person_last_saved_by_person_id",
                table: "news_post"
            );

            migrationBuilder.DropIndex(
                name: "ix_news_post_last_saved_by_person_id",
                table: "news_post"
            );

            migrationBuilder.DropColumn(name: "last_saved_by_person_id", table: "news_post");
        }
    }
}
