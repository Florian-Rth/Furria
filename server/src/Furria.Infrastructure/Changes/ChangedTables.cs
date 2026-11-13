using System.Collections.Frozen;
using System.Diagnostics.Contracts;
using Furria.Application.Changes;
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
using Furria.Infrastructure.Media;
using Furria.Infrastructure.Push;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace Furria.Infrastructure.Changes;

public static class ChangedTables
{
    private static readonly FrozenDictionary<Type, DomainChange[]> ChangesByEntity = new Dictionary<
        Type,
        DomainChange[]
    >
    {
        [typeof(Person)] = [DomainChange.Person, DomainChange.Picture],
        [typeof(Membership)] = [DomainChange.Membership],
        [typeof(MembershipPause)] = [DomainChange.Membership],
        [typeof(FeeReduction)] = [DomainChange.Membership],
        [typeof(MembershipApplication)] = [DomainChange.MembershipApplication],
        [typeof(Account)] = [DomainChange.Account, DomainChange.AnnouncementSeen],
        [typeof(Invitation)] = [DomainChange.Account],
        [typeof(AccountEvent)] = [DomainChange.Account],
        [typeof(EmailConfirmation)] = [DomainChange.Account],
        [typeof(Group)] = [DomainChange.Group, DomainChange.Picture],
        [typeof(GroupKind)] = [DomainChange.GroupKind],
        [typeof(GroupMembership)] = [DomainChange.GroupMembership],
        [typeof(GroupAdmin)] = [DomainChange.GroupAdmin],
        [typeof(UsualTrainingTime)] = [DomainChange.UsualTrainingTime],
        [typeof(CalendarEntry)] = [DomainChange.CalendarEntry],
        [typeof(CalendarEntryGroup)] = [DomainChange.CalendarEntry],
        [typeof(CalendarEntryAudienceGroup)] = [DomainChange.CalendarEntry],
        [typeof(CalendarEntryAudiencePerson)] = [DomainChange.CalendarEntry],
        [typeof(Poll)] = [DomainChange.CalendarEntry],
        [typeof(PollOption)] = [DomainChange.CalendarEntry],
        [typeof(PollVote)] = [DomainChange.CalendarPollVote],
        [typeof(SignUpList)] = [DomainChange.CalendarEntry],
        [typeof(SignUpLine)] = [DomainChange.CalendarSignUpLine],
        [typeof(CalendarDaySchedule)] = [DomainChange.CalendarEntry],
        [typeof(CalendarDayScheduleStep)] = [DomainChange.CalendarEntry],
        [typeof(AttendanceResponse)] = [DomainChange.AttendanceResponse],
        [typeof(AttendanceResponseChange)] = [DomainChange.AttendanceResponse],
        [typeof(Event)] = [DomainChange.Event],
        [typeof(EventPresalePlace)] = [DomainChange.Event],
        [typeof(Role)] = [DomainChange.Role],
        [typeof(RolePermission)] = [DomainChange.Role],
        [typeof(RoleHolding)] = [DomainChange.RoleHolding],
        [typeof(BoardOffice)] = [DomainChange.BoardOffice],
        [typeof(BoardSeat)] = [DomainChange.BoardSeat],
        [typeof(Session)] = [DomainChange.SessionRecord],
        [typeof(Venue)] = [DomainChange.Venue],
        [typeof(VenueOpeningSlot)] = [DomainChange.Venue],
        [typeof(KeyHolding)] = [DomainChange.KeyHolding],
        [typeof(ClubRecord)] = [DomainChange.ClubRecord],
        [typeof(Announcement)] = [DomainChange.Announcement],
        [typeof(AnnouncementMention)] = [DomainChange.Announcement],
        [typeof(AnnouncementBorrowedAddOn)] = [DomainChange.Announcement],
        [typeof(MediaItem)] = [DomainChange.Media, DomainChange.Picture],
        [typeof(Album)] = [DomainChange.Media],
        [typeof(UploadLink)] = [DomainChange.Media],
        [typeof(NewsPost)] = [DomainChange.NewsPost],
        [typeof(NewsPostMention)] = [DomainChange.NewsPost],
        [typeof(WebsitePicture)] = [DomainChange.WebsitePicture],
        [typeof(Act)] = [DomainChange.Act],
        [typeof(ActCastChange)] = [DomainChange.Act],
        [typeof(FrozenCastMember)] = [DomainChange.Act],
        [typeof(ActWish)] = [DomainChange.Act],
        [typeof(ActCoEditor)] = [DomainChange.ActCoEditor],
        [typeof(ActSong)] = [DomainChange.ActMusic],
        [typeof(ActFinalTrack)] = [DomainChange.ActMusic],
        [typeof(ActFinalTrackAlignment)] = [DomainChange.ActMusic],
        [typeof(ActStep)] = [DomainChange.ActSteps],
        [typeof(ActPart)] = [DomainChange.ActSteps],
        [typeof(ActVideo)] = [DomainChange.ActVideos],
        [typeof(Spot)] = [DomainChange.ActChoreography],
        [typeof(Choreography)] = [DomainChange.ActChoreography, DomainChange.ActEvening],
        [typeof(ChoreographyVersion)] = [DomainChange.ActChoreography, DomainChange.ActEvening],
        [typeof(Appearance)] = [DomainChange.RunningOrder, DomainChange.ActEvening],
        [typeof(AppearanceCastChange)] = [DomainChange.ActEvening, DomainChange.RunningOrder],
        [typeof(AppearanceSpot)] = [DomainChange.ActEvening],
        [typeof(RunningOrder)] = [DomainChange.RunningOrder],
        [typeof(RunningOrderRule)] = [DomainChange.RunningOrder],
        [typeof(RunningOrderSuspendedWish)] = [DomainChange.RunningOrder],
        [typeof(BeerListEnrollment)] = [DomainChange.BeerListEnrollment],
        [typeof(BeerPot)] = [DomainChange.BeerPot],
        [typeof(BeerStockMovement)] = [DomainChange.BeerStock],
        [typeof(BeerCrate)] = [DomainChange.BeerCrate],
        [typeof(BeerPayment)] = [DomainChange.BeerPayment],
        [typeof(PushSubscription)] = [DomainChange.PushDevice],
        [typeof(Hall)] = [DomainChange.Hall],
        [typeof(TablePlan)] = [DomainChange.TablePlan],
        [typeof(TableType)] = [DomainChange.Seating],
        [typeof(SeatingStandard)] = [DomainChange.Seating],
        [typeof(ClaimWindow)] = [DomainChange.ClaimWindow],
        [typeof(MatcherStatement)] = [DomainChange.GroupMatcher],
        [typeof(Stance)] = [DomainChange.GroupMatcher],
        [typeof(GroupAdmissionAge)] = [DomainChange.GroupMatcher],
    }.ToFrozenDictionary();

    private static readonly FrozenSet<Type> Unrelated = new[]
    {
        typeof(IdentityUserClaim<int>),
        typeof(IdentityUserLogin<int>),
        typeof(IdentityUserToken<int>),
        typeof(IdentityUserPasskey<int>),
        typeof(RefreshToken),
        typeof(PasskeyChallenge),
        typeof(DataProtectionKey),
        typeof(OutboxMail),
        typeof(OutboxPush),
        typeof(OutboxCalendarPush),
        typeof(LogEntry),
        typeof(MediaJob),
        typeof(MediaFileTombstone),
        typeof(MediaWorkerHeartbeat),
        typeof(BeerTabReminder),
    }.ToFrozenSet();

    [Pure]
    private static IEnumerable<IEntityType> TabledEntities(IModel model) =>
        model
            .GetEntityTypes()
            .Where(entity => !entity.IsOwned() && entity.GetTableName() is not null);

    public static FrozenDictionary<string, IReadOnlyList<DomainChange>> ByTable(IModel model) =>
        TabledEntities(model)
            .Where(entity => ChangesByEntity.ContainsKey(entity.ClrType))
            .ToFrozenDictionary(
                entity => entity.GetTableName()!,
                entity => (IReadOnlyList<DomainChange>)ChangesByEntity[entity.ClrType],
                StringComparer.Ordinal
            );

    public static IReadOnlyList<string> UnrelatedTables(IModel model) =>
        [
            .. TabledEntities(model)
                .Where(entity => Unrelated.Contains(entity.ClrType))
                .Select(entity => entity.GetTableName()!),
        ];

    public static IReadOnlyList<string> DisagreementsWith(IModel model)
    {
        var entities = TabledEntities(model).Select(entity => entity.ClrType).ToHashSet();

        return
        [
            .. entities
                .Where(type => !ChangesByEntity.ContainsKey(type) && !Unrelated.Contains(type))
                .Select(type => $"{type.Name} names no change and is not declared unrelated"),
            .. entities
                .Where(type => ChangesByEntity.ContainsKey(type) && Unrelated.Contains(type))
                .Select(type => $"{type.Name} names changes but is declared unrelated"),
            .. ChangesByEntity
                .Keys.Concat(Unrelated)
                .Where(type => !entities.Contains(type))
                .Select(type => $"{type.Name} is no table of the model"),
        ];
    }
}
