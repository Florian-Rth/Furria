namespace Furria.Application.Authorization;

public static class FurriaPermissions
{
    public const string PersonsReadDetails = "persons.read_details";
    public const string PersonsManage = "persons.manage";
    public const string PersonsDelete = "persons.delete";
    public const string GroupsManage = "groups.manage";
    public const string RolesManage = "roles.manage";
    public const string AnnouncementsPost = "announcements.post";
    public const string ClubManage = "club.manage";
    public const string KeyHoldingsManage = "key_holdings.manage";
    public const string BoardManage = "board.manage";
    public const string CalendarManageClub = "calendar.manage_club";
    public const string AccountsManage = "accounts.manage";
    public const string MembershipApplicationsDecide = "membership_applications.decide";
    public const string EventsManage = "events.manage";
    public const string EventsRunningOrder = "events.running_order";
    public const string EventsHall = "events.hall";
    public const string GalleryUpload = "gallery.upload";
    public const string GalleryManage = "gallery.manage";
    public const string GalleryPublish = "gallery.publish";
    public const string NewsManage = "news.manage";
    public const string BeerListManage = "beer_list.manage";
    public const string SystemView = "system.view";
    public const string ClaimWindowManage = "claim_window.manage";
    public const string GroupMatcherManage = "group_matcher.manage";
    public const string ClubRead = "club.read";
    public const string BeerListTake = "beer_list.take";

    public static readonly IReadOnlyList<string> All =
    [
        PersonsReadDetails,
        PersonsManage,
        PersonsDelete,
        GroupsManage,
        RolesManage,
        AnnouncementsPost,
        ClubManage,
        KeyHoldingsManage,
        BoardManage,
        CalendarManageClub,
        AccountsManage,
        MembershipApplicationsDecide,
        EventsManage,
        EventsRunningOrder,
        EventsHall,
        GalleryUpload,
        GalleryManage,
        GalleryPublish,
        NewsManage,
        BeerListManage,
        SystemView,
        ClaimWindowManage,
        GroupMatcherManage,
    ];

    public static readonly IReadOnlyList<string> ImpliedByRelationship = [ClubRead, BeerListTake];
}
