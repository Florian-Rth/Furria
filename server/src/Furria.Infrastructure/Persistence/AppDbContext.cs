using Furria.Core.BeerList;
using Furria.Core.Club;
using Furria.Core.Events;
using Furria.Core.Gallery;
using Furria.Core.GroupMatcher;
using Furria.Core.Groups;
using Furria.Core.Halls;
using Furria.Core.Identity;
using Furria.Core.Media;
using Furria.Core.MembershipApplications;
using Furria.Core.News;
using Furria.Core.Roles;
using Furria.Core.RunningOrders;
using Furria.Core.Studio;
using Furria.Core.Website;
using Furria.Infrastructure.Club;
using Furria.Infrastructure.Identity;
using Furria.Infrastructure.Logging;
using Furria.Infrastructure.Mail;
using Furria.Infrastructure.Management;
using Furria.Infrastructure.Media;
using Furria.Infrastructure.Push;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Persistence;

public sealed class AppDbContext : IdentityUserContext<Account, int>, IDataProtectionKeyContext
{
    public const string ConnectionName = "AppDb";

    public DbSet<Person> People => Set<Person>();

    public DbSet<Membership> Memberships => Set<Membership>();

    public DbSet<MembershipPause> MembershipPauses => Set<MembershipPause>();

    public DbSet<FeeReduction> FeeReductions => Set<FeeReduction>();

    public DbSet<Group> Groups => Set<Group>();

    public DbSet<GroupKind> GroupKinds => Set<GroupKind>();

    public DbSet<GroupMembership> GroupMemberships => Set<GroupMembership>();

    public DbSet<GroupAdmin> GroupAdmins => Set<GroupAdmin>();

    public DbSet<MatcherStatement> MatcherStatements => Set<MatcherStatement>();

    public DbSet<Stance> Stances => Set<Stance>();

    public DbSet<GroupAdmissionAge> GroupAdmissionAges => Set<GroupAdmissionAge>();

    public DbSet<UsualTrainingTime> UsualTrainingTimes => Set<UsualTrainingTime>();

    public DbSet<Role> Roles => Set<Role>();

    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();

    public DbSet<RoleHolding> RoleHoldings => Set<RoleHolding>();

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    public DbSet<Invitation> Invitations => Set<Invitation>();

    public DbSet<AccountEvent> AccountEvents => Set<AccountEvent>();

    public DbSet<ClaimWindow> ClaimWindows => Set<ClaimWindow>();

    public DbSet<EmailConfirmation> EmailConfirmations => Set<EmailConfirmation>();

    public DbSet<PasskeyChallenge> PasskeyChallenges => Set<PasskeyChallenge>();

    public DbSet<PushSubscription> PushSubscriptions => Set<PushSubscription>();

    public DbSet<MutedPushTopic> MutedPushTopics => Set<MutedPushTopic>();

    public DbSet<Session> Sessions => Set<Session>();

    public DbSet<Venue> Venues => Set<Venue>();

    public DbSet<VenueOpeningSlot> VenueOpeningSlots => Set<VenueOpeningSlot>();

    public DbSet<Announcement> Announcements => Set<Announcement>();

    public DbSet<AnnouncementMention> AnnouncementMentions => Set<AnnouncementMention>();

    public DbSet<AnnouncementBorrowedAddOn> AnnouncementBorrowedAddOns =>
        Set<AnnouncementBorrowedAddOn>();

    public DbSet<KeyHolding> KeyHoldings => Set<KeyHolding>();

    public DbSet<BoardOffice> BoardOffices => Set<BoardOffice>();

    public DbSet<BoardSeat> BoardSeats => Set<BoardSeat>();

    public DbSet<CalendarEntry> CalendarEntries => Set<CalendarEntry>();

    public DbSet<AttendanceResponse> AttendanceResponses => Set<AttendanceResponse>();

    public DbSet<AttendanceResponseChange> AttendanceResponseChanges =>
        Set<AttendanceResponseChange>();

    public DbSet<CalendarEntryGroup> CalendarEntryGroups => Set<CalendarEntryGroup>();

    public DbSet<CalendarEntryAudienceGroup> CalendarEntryAudienceGroups =>
        Set<CalendarEntryAudienceGroup>();

    public DbSet<CalendarEntryAudiencePerson> CalendarEntryAudiencePeople =>
        Set<CalendarEntryAudiencePerson>();

    public DbSet<Poll> Polls => Set<Poll>();

    public DbSet<PollOption> PollOptions => Set<PollOption>();

    public DbSet<PollVote> PollVotes => Set<PollVote>();

    public DbSet<SignUpList> SignUpLists => Set<SignUpList>();

    public DbSet<SignUpLine> SignUpLines => Set<SignUpLine>();

    public DbSet<CalendarDaySchedule> CalendarDaySchedules => Set<CalendarDaySchedule>();

    public DbSet<CalendarDayScheduleStep> CalendarDayScheduleSteps =>
        Set<CalendarDayScheduleStep>();

    public DbSet<Event> Events => Set<Event>();

    public DbSet<EventPresalePlace> EventPresalePlaces => Set<EventPresalePlace>();

    public DbSet<ClubRecord> ClubRecords => Set<ClubRecord>();

    public DbSet<DataProtectionKey> DataProtectionKeys => Set<DataProtectionKey>();

    public DbSet<OutboxMail> OutboxMails => Set<OutboxMail>();

    public DbSet<OutboxCalendarPush> OutboxCalendarPushes => Set<OutboxCalendarPush>();

    public DbSet<OutboxPush> OutboxPushes => Set<OutboxPush>();

    public DbSet<MembershipApplication> MembershipApplications => Set<MembershipApplication>();

    public DbSet<MediaItem> MediaItems => Set<MediaItem>();

    public DbSet<MediaJob> MediaJobs => Set<MediaJob>();

    public DbSet<Album> Albums => Set<Album>();

    public DbSet<UploadLink> UploadLinks => Set<UploadLink>();

    public DbSet<NewsPost> NewsPosts => Set<NewsPost>();

    public DbSet<NewsPostMention> NewsPostMentions => Set<NewsPostMention>();

    public DbSet<MediaFileTombstone> MediaFileTombstones => Set<MediaFileTombstone>();

    public DbSet<WebsitePicture> WebsitePictures => Set<WebsitePicture>();

    public DbSet<LogEntry> LogEntries => Set<LogEntry>();

    public DbSet<MediaWorkerHeartbeat> MediaWorkerHeartbeats => Set<MediaWorkerHeartbeat>();

    public DbSet<Act> Acts => Set<Act>();

    public DbSet<ActCastChange> ActCastChanges => Set<ActCastChange>();

    public DbSet<FrozenCastMember> FrozenCastMembers => Set<FrozenCastMember>();

    public DbSet<ActWish> ActWishes => Set<ActWish>();

    public DbSet<RunningOrder> RunningOrders => Set<RunningOrder>();

    public DbSet<Appearance> Appearances => Set<Appearance>();

    public DbSet<AppearanceCastChange> AppearanceCastChanges => Set<AppearanceCastChange>();

    public DbSet<RunningOrderRule> RunningOrderRules => Set<RunningOrderRule>();

    public DbSet<RunningOrderSuspendedWish> RunningOrderSuspendedWishes =>
        Set<RunningOrderSuspendedWish>();

    public DbSet<ActSong> ActSongs => Set<ActSong>();

    public DbSet<ActFinalTrack> ActFinalTracks => Set<ActFinalTrack>();

    public DbSet<ActFinalTrackAlignment> ActFinalTrackAlignments => Set<ActFinalTrackAlignment>();

    public DbSet<ActStep> ActSteps => Set<ActStep>();

    public DbSet<ActPart> ActParts => Set<ActPart>();

    public DbSet<ActVideo> ActVideos => Set<ActVideo>();

    public DbSet<Spot> Spots => Set<Spot>();

    public DbSet<AppearanceSpot> AppearanceSpots => Set<AppearanceSpot>();

    public DbSet<Choreography> Choreographies => Set<Choreography>();

    public DbSet<ChoreographyVersion> ChoreographyVersions => Set<ChoreographyVersion>();

    public DbSet<ActCoEditor> ActCoEditors => Set<ActCoEditor>();

    public DbSet<BeerPot> BeerPots => Set<BeerPot>();

    public DbSet<BeerListEnrollment> BeerListEnrollments => Set<BeerListEnrollment>();

    public DbSet<BeerStockMovement> BeerStockMovements => Set<BeerStockMovement>();

    public DbSet<BeerCrate> BeerCrates => Set<BeerCrate>();

    public DbSet<BeerPayment> BeerPayments => Set<BeerPayment>();

    public DbSet<BeerTabReminder> BeerTabReminders => Set<BeerTabReminder>();

    public DbSet<TableType> TableTypes => Set<TableType>();

    public DbSet<SeatingStandard> SeatingStandards => Set<SeatingStandard>();

    public DbSet<Hall> Halls => Set<Hall>();

    public DbSet<TablePlan> TablePlans => Set<TablePlan>();

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
