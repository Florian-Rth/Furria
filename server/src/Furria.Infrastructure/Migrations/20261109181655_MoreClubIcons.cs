using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MoreClubIcons : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(name: "ck_role_icon", table: "role");

            migrationBuilder.DropCheckConstraint(name: "ck_group_icon", table: "group");

            migrationBuilder.DropCheckConstraint(
                name: "ck_board_office_icon",
                table: "board_office"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_role_icon",
                table: "role",
                sql: "icon IS NULL OR icon IN ('Crown', 'Euro', 'Bolt', 'Shield', 'Camera', 'Sparkle', 'Mic', 'MusicNote', 'Drum', 'Mask', 'Megaphone', 'Star', 'Trophy', 'Flag', 'Key', 'Shirt', 'Pen', 'Wrench', 'Palette', 'Heart', 'Mug', 'Calendar', 'Whistle', 'Broom', 'Scepter', 'JesterCap', 'Chain', 'ViceCrown', 'ChildCrown', 'Laurel', 'Medal', 'Gavel', 'Briefcase', 'Quill', 'Ledger', 'JingleBell', 'Castle', 'Diamond', 'Handshake', 'Child', 'Confetti', 'Rocket')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_group_icon",
                table: "group",
                sql: "icon IS NULL OR icon IN ('Crown', 'Euro', 'Bolt', 'Shield', 'Camera', 'Sparkle', 'Mic', 'MusicNote', 'Drum', 'Mask', 'Megaphone', 'Star', 'Trophy', 'Flag', 'Key', 'Shirt', 'Pen', 'Wrench', 'Palette', 'Heart', 'Mug', 'Calendar', 'Whistle', 'Broom', 'Scepter', 'JesterCap', 'Chain', 'ViceCrown', 'ChildCrown', 'Laurel', 'Medal', 'Gavel', 'Briefcase', 'Quill', 'Ledger', 'JingleBell', 'Castle', 'Diamond', 'Handshake', 'Child', 'Confetti', 'Rocket')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_board_office_icon",
                table: "board_office",
                sql: "icon IS NULL OR icon IN ('Crown', 'Euro', 'Bolt', 'Shield', 'Camera', 'Sparkle', 'Mic', 'MusicNote', 'Drum', 'Mask', 'Megaphone', 'Star', 'Trophy', 'Flag', 'Key', 'Shirt', 'Pen', 'Wrench', 'Palette', 'Heart', 'Mug', 'Calendar', 'Whistle', 'Broom', 'Scepter', 'JesterCap', 'Chain', 'ViceCrown', 'ChildCrown', 'Laurel', 'Medal', 'Gavel', 'Briefcase', 'Quill', 'Ledger', 'JingleBell', 'Castle', 'Diamond', 'Handshake', 'Child', 'Confetti', 'Rocket')"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(name: "ck_role_icon", table: "role");

            migrationBuilder.DropCheckConstraint(name: "ck_group_icon", table: "group");

            migrationBuilder.DropCheckConstraint(
                name: "ck_board_office_icon",
                table: "board_office"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_role_icon",
                table: "role",
                sql: "icon IS NULL OR icon IN ('Crown', 'Euro', 'Bolt', 'Shield', 'Camera', 'Sparkle', 'Mic', 'MusicNote', 'Drum', 'Mask', 'Megaphone', 'Star', 'Trophy', 'Flag', 'Key', 'Shirt', 'Pen', 'Wrench', 'Palette', 'Heart', 'Mug', 'Calendar', 'Whistle', 'Broom')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_group_icon",
                table: "group",
                sql: "icon IS NULL OR icon IN ('Crown', 'Euro', 'Bolt', 'Shield', 'Camera', 'Sparkle', 'Mic', 'MusicNote', 'Drum', 'Mask', 'Megaphone', 'Star', 'Trophy', 'Flag', 'Key', 'Shirt', 'Pen', 'Wrench', 'Palette', 'Heart', 'Mug', 'Calendar', 'Whistle', 'Broom')"
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_board_office_icon",
                table: "board_office",
                sql: "icon IS NULL OR icon IN ('Crown', 'Euro', 'Bolt', 'Shield', 'Camera', 'Sparkle', 'Mic', 'MusicNote', 'Drum', 'Mask', 'Megaphone', 'Star', 'Trophy', 'Flag', 'Key', 'Shirt', 'Pen', 'Wrench', 'Palette', 'Heart', 'Mug', 'Calendar', 'Whistle', 'Broom')"
            );
        }
    }
}
