using Furria.Core.Identity;
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

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
