using Furria.Infrastructure.Changes;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class LiveChangeFeed : Migration
    {
        private static readonly string[] Tables =
        [
            "account",
            "account_event",
            "act",
            "act_cast_change",
            "act_co_editor",
            "act_final_track",
            "act_final_track_alignment",
            "act_frozen_cast_member",
            "act_part",
            "act_song",
            "act_step",
            "act_video",
            "act_wish",
            "album",
            "announcement",
            "appearance",
            "appearance_cast_change",
            "appearance_spot",
            "attendance_response",
            "attendance_response_change",
            "beer_crate",
            "beer_list_enrollment",
            "beer_payment",
            "beer_pot",
            "beer_stock_movement",
            "board_office",
            "board_seat",
            "calendar_entry",
            "calendar_entry_group",
            "choreography",
            "choreography_version",
            "club_record",
            "email_confirmation",
            "event",
            "event_presale_place",
            "fee_reduction",
            "group",
            "group_admin",
            "group_kind",
            "group_membership",
            "hall",
            "invitation",
            "key_holding",
            "media_item",
            "membership",
            "membership_application",
            "membership_pause",
            "news_post",
            "news_post_mention",
            "person",
            "push_subscription",
            "role",
            "role_holding",
            "role_permission",
            "running_order",
            "running_order_rule",
            "running_order_suspended_wish",
            "seating_standard",
            "session",
            "spot",
            "table_plan",
            "table_type",
            "upload_link",
            "usual_training_time",
            "venue",
            "venue_opening_slot",
            "website_picture",
        ];

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateChangeNotifier();
            foreach (var table in Tables)
                migrationBuilder.NotifyChangesOf(table);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            foreach (var table in Tables)
                migrationBuilder.StopNotifyingChangesOf(table);
            migrationBuilder.DropChangeNotifier();
        }
    }
}
