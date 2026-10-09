using Furria.Core.Club;
using Furria.Core.Events;
using Furria.Core.Gallery;
using Furria.Core.Groups;
using Furria.Core.Identity;
using Furria.Core.Media;
using Furria.Core.MembershipApplications;
using Furria.Core.Roles;
using Furria.Infrastructure.Identity;
using Furria.Infrastructure.Mail;
using Furria.Infrastructure.Management;
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

    public DbSet<GroupTrainingSlot> GroupTrainingSlots => Set<GroupTrainingSlot>();

    public DbSet<Role> Roles => Set<Role>();

    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();

    public DbSet<RoleHolding> RoleHoldings => Set<RoleHolding>();

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    public DbSet<Invitation> Invitations => Set<Invitation>();

    public DbSet<AccountEvent> AccountEvents => Set<AccountEvent>();

    public DbSet<EmailConfirmation> EmailConfirmations => Set<EmailConfirmation>();

    public DbSet<PasskeyChallenge> PasskeyChallenges => Set<PasskeyChallenge>();

    public DbSet<Session> Sessions => Set<Session>();

    public DbSet<Venue> Venues => Set<Venue>();

    public DbSet<Announcement> Announcements => Set<Announcement>();

    public DbSet<KeyHolding> KeyHoldings => Set<KeyHolding>();

    public DbSet<BoardOffice> BoardOffices => Set<BoardOffice>();

    public DbSet<BoardSeat> BoardSeats => Set<BoardSeat>();

    public DbSet<CalendarEntry> CalendarEntries => Set<CalendarEntry>();

    public DbSet<AttendanceResponse> AttendanceResponses => Set<AttendanceResponse>();

    public DbSet<CalendarEntryGroup> CalendarEntryGroups => Set<CalendarEntryGroup>();

    public DbSet<Event> Events => Set<Event>();

    public DbSet<TicketRequest> TicketRequests => Set<TicketRequest>();

    public DbSet<ClubRecord> ClubRecords => Set<ClubRecord>();

    public DbSet<DataProtectionKey> DataProtectionKeys => Set<DataProtectionKey>();

    public DbSet<OutboxMail> OutboxMails => Set<OutboxMail>();

    public DbSet<MembershipApplication> MembershipApplications => Set<MembershipApplication>();

    public DbSet<ToDoMark> ToDoMarks => Set<ToDoMark>();

    public DbSet<MediaItem> MediaItems => Set<MediaItem>();

    public DbSet<MediaJob> MediaJobs => Set<MediaJob>();

    public DbSet<Album> Albums => Set<Album>();

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
