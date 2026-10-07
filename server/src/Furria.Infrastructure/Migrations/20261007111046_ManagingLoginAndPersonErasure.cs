using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ManagingLoginAndPersonErasure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_announcement_person_author_person_id",
                table: "announcement"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_attendance_response_person_person_id",
                table: "attendance_response"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_board_seat_person_person_id",
                table: "board_seat"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_fee_reduction_person_person_id",
                table: "fee_reduction"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_group_admin_person_person_id",
                table: "group_admin"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_group_membership_person_person_id",
                table: "group_membership"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_key_holding_person_person_id",
                table: "key_holding"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_membership_person_person_id",
                table: "membership"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_role_holding_person_person_id",
                table: "role_holding"
            );

            migrationBuilder.AlterColumn<int>(
                name: "author_person_id",
                table: "announcement",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer"
            );

            migrationBuilder.AlterColumn<int>(
                name: "person_id",
                table: "account",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer"
            );

            migrationBuilder.AddColumn<bool>(
                name: "is_managing_login",
                table: "account",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );

            migrationBuilder.CreateIndex(
                name: "ix_account_managing_login",
                table: "account",
                column: "is_managing_login",
                unique: true,
                filter: "is_managing_login"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_account_person_unless_managing_login",
                table: "account",
                sql: "(person_id IS NULL) = is_managing_login"
            );

            migrationBuilder.AddForeignKey(
                name: "fk_announcement_person_author_person_id",
                table: "announcement",
                column: "author_person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull
            );

            migrationBuilder.AddForeignKey(
                name: "fk_attendance_response_person_person_id",
                table: "attendance_response",
                column: "person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "fk_board_seat_person_person_id",
                table: "board_seat",
                column: "person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "fk_fee_reduction_person_person_id",
                table: "fee_reduction",
                column: "person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "fk_group_admin_person_person_id",
                table: "group_admin",
                column: "person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "fk_group_membership_person_person_id",
                table: "group_membership",
                column: "person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "fk_key_holding_person_person_id",
                table: "key_holding",
                column: "person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "fk_membership_person_person_id",
                table: "membership",
                column: "person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "fk_role_holding_person_person_id",
                table: "role_holding",
                column: "person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_announcement_person_author_person_id",
                table: "announcement"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_attendance_response_person_person_id",
                table: "attendance_response"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_board_seat_person_person_id",
                table: "board_seat"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_fee_reduction_person_person_id",
                table: "fee_reduction"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_group_admin_person_person_id",
                table: "group_admin"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_group_membership_person_person_id",
                table: "group_membership"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_key_holding_person_person_id",
                table: "key_holding"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_membership_person_person_id",
                table: "membership"
            );

            migrationBuilder.DropForeignKey(
                name: "fk_role_holding_person_person_id",
                table: "role_holding"
            );

            migrationBuilder.DropIndex(name: "ix_account_managing_login", table: "account");

            migrationBuilder.DropCheckConstraint(
                name: "ck_account_person_unless_managing_login",
                table: "account"
            );

            migrationBuilder.DropColumn(name: "is_managing_login", table: "account");

            migrationBuilder.AlterColumn<int>(
                name: "author_person_id",
                table: "announcement",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true
            );

            migrationBuilder.AlterColumn<int>(
                name: "person_id",
                table: "account",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true
            );

            migrationBuilder.AddForeignKey(
                name: "fk_announcement_person_author_person_id",
                table: "announcement",
                column: "author_person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict
            );

            migrationBuilder.AddForeignKey(
                name: "fk_attendance_response_person_person_id",
                table: "attendance_response",
                column: "person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict
            );

            migrationBuilder.AddForeignKey(
                name: "fk_board_seat_person_person_id",
                table: "board_seat",
                column: "person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict
            );

            migrationBuilder.AddForeignKey(
                name: "fk_fee_reduction_person_person_id",
                table: "fee_reduction",
                column: "person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict
            );

            migrationBuilder.AddForeignKey(
                name: "fk_group_admin_person_person_id",
                table: "group_admin",
                column: "person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict
            );

            migrationBuilder.AddForeignKey(
                name: "fk_group_membership_person_person_id",
                table: "group_membership",
                column: "person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict
            );

            migrationBuilder.AddForeignKey(
                name: "fk_key_holding_person_person_id",
                table: "key_holding",
                column: "person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict
            );

            migrationBuilder.AddForeignKey(
                name: "fk_membership_person_person_id",
                table: "membership",
                column: "person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict
            );

            migrationBuilder.AddForeignKey(
                name: "fk_role_holding_person_person_id",
                table: "role_holding",
                column: "person_id",
                principalTable: "person",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict
            );
        }
    }
}
