using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Core.Identity;
using Furria.Core.Roles;
using Furria.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Persistence;

public sealed class AppDbContext : IdentityUserContext<Account, int>
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

    public DbSet<Session> Sessions => Set<Session>();

    public DbSet<Venue> Venues => Set<Venue>();

    public DbSet<Announcement> Announcements => Set<Announcement>();

    public DbSet<KeyHolding> KeyHoldings => Set<KeyHolding>();

    public DbSet<BoardOffice> BoardOffices => Set<BoardOffice>();

    public DbSet<BoardSeat> BoardSeats => Set<BoardSeat>();

    public DbSet<CalendarEntry> CalendarEntries => Set<CalendarEntry>();

    public DbSet<AttendanceResponse> AttendanceResponses => Set<AttendanceResponse>();

    public DbSet<CalendarEntryGroup> CalendarEntryGroups => Set<CalendarEntryGroup>();

    public DbSet<ClubRecord> ClubRecords => Set<ClubRecord>();

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
