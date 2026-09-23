using Furria.Application.Authorization;
using Furria.Application.Identity;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Core.Roles;
using Furria.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.Identity;

public sealed class BootstrapAdminSeeder : IHostedService
{
    private const string AdminRoleName = "Admin";
    private const string AdminRoleDescription =
        "Vollzugriff. Vom System angelegt, danach ganz normale Vereinsdaten.";

    private static readonly string AdminRoleNameLowered = AdminRoleName.ToLowerInvariant();

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly BootstrapAdminOptions _options;
    private readonly ILogger<BootstrapAdminSeeder> _logger;

    public BootstrapAdminSeeder(
        IServiceScopeFactory scopeFactory,
        IOptions<BootstrapAdminOptions> options,
        ILogger<BootstrapAdminSeeder> logger
    )
    {
        _scopeFactory = scopeFactory;
        _options = options.Value;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        if (_options.Email.Length == 0 || _options.Password.Length == 0)
        {
            _logger.LogInformation("Bootstrap admin not configured, seeding skipped");
            return;
        }

        await using var scope = _scopeFactory.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<Account>>();

        await using var transaction = await dbContext.Database.BeginTransactionAsync(
            cancellationToken
        );

        await EnsureBootstrapAccountAsync(dbContext, userManager, transaction, cancellationToken);
        await EnsureAdminRoleAsync(
            dbContext,
            userManager,
            scope.ServiceProvider.GetRequiredService<TimeProvider>(),
            cancellationToken
        );

        await transaction.CommitAsync(cancellationToken);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    private async Task EnsureBootstrapAccountAsync(
        AppDbContext dbContext,
        UserManager<Account> userManager,
        IDbContextTransaction transaction,
        CancellationToken ct
    )
    {
        if (await userManager.FindByEmailAsync(_options.Email) is { } existing)
        {
            await ReopenBootstrapAccountAsync(dbContext, existing, ct);
            return;
        }

        var person = new Person
        {
            FirstName = _options.FirstName,
            LastName = _options.LastName,
            Email = _options.Email,
        };

        dbContext.People.Add(person);
        await dbContext.SaveChangesAsync(ct);

        var account = new Account
        {
            UserName = _options.Email,
            Email = _options.Email,
            EmailConfirmed = true,
            PersonId = person.Id,
        };

        var created = await userManager.CreateAsync(account, _options.Password);
        if (created.Succeeded)
        {
            _logger.LogInformation(
                "Bootstrap admin account {AccountId} created for {Email}",
                account.Id,
                _options.Email
            );
            return;
        }

        await transaction.RollbackAsync(ct);
        throw new InvalidOperationException(
            $"The bootstrap admin could not be created: {Describe(created)}"
        );
    }

    private async Task ReopenBootstrapAccountAsync(
        AppDbContext dbContext,
        Account account,
        CancellationToken ct
    )
    {
        if (!account.IsDisabled)
            return;

        account.IsDisabled = false;
        await dbContext.SaveChangesAsync(ct);
        _logger.LogInformation("Bootstrap admin account {AccountId} re-enabled", account.Id);
    }

    private async Task EnsureAdminRoleAsync(
        AppDbContext dbContext,
        UserManager<Account> userManager,
        TimeProvider timeProvider,
        CancellationToken ct
    )
    {
        var today = ClubClock.Today(timeProvider);
        var adminRoleId = await dbContext
            .Roles.Where(role => role.Name.ToLower() == AdminRoleNameLowered)
            .Select(role => (int?)role.Id)
            .FirstOrDefaultAsync(ct);

        if (adminRoleId is not null)
        {
            await ReconcileAdminRoleAsync(dbContext, userManager, adminRoleId.Value, today, ct);
            return;
        }

        var role = new Role
        {
            Name = AdminRoleName,
            Description = AdminRoleDescription,
            Permissions =
            [
                .. FurriaPermissions.All.Select(key => new RolePermission { PermissionKey = key }),
            ],
            Holdings =
            [
                new RoleHolding
                {
                    PersonId = await RequireBootstrapPersonIdAsync(userManager),
                    SinceOn = today,
                },
            ],
        };

        dbContext.Roles.Add(role);
        await dbContext.SaveChangesAsync(ct);
        _logger.LogInformation("Admin role {RoleId} created", role.Id);
    }

    private async Task ReconcileAdminRoleAsync(
        AppDbContext dbContext,
        UserManager<Account> userManager,
        int adminRoleId,
        DateOnly today,
        CancellationToken ct
    )
    {
        await ReopenAdminRoleAsync(dbContext, adminRoleId, ct);
        await GrantEveryMissingKeyAsync(dbContext, adminRoleId, ct);
        await EnsureAdminRoleIsHeldAsync(dbContext, userManager, adminRoleId, today, ct);
    }

    private async Task ReopenAdminRoleAsync(
        AppDbContext dbContext,
        int adminRoleId,
        CancellationToken ct
    )
    {
        var role = await dbContext.Roles.SingleAsync(row => row.Id == adminRoleId, ct);
        if (role.ArchivedOn is null)
            return;

        role.ArchivedOn = null;
        await dbContext.SaveChangesAsync(ct);
        _logger.LogInformation("Admin role {RoleId} restored from archive", adminRoleId);
    }

    private async Task GrantEveryMissingKeyAsync(
        AppDbContext dbContext,
        int adminRoleId,
        CancellationToken ct
    )
    {
        var granted = await dbContext
            .RolePermissions.Where(permission => permission.RoleId == adminRoleId)
            .Select(permission => permission.PermissionKey)
            .ToListAsync(ct);

        var missing = FurriaPermissions.All.Except(granted).ToList();
        if (missing.Count == 0)
            return;

        dbContext.RolePermissions.AddRange(
            missing.Select(key => new RolePermission { RoleId = adminRoleId, PermissionKey = key })
        );
        await dbContext.SaveChangesAsync(ct);
        _logger.LogInformation(
            "Admin role {RoleId} granted {MissingPermissionCount} missing permissions",
            adminRoleId,
            missing.Count
        );
    }

    private async Task EnsureAdminRoleIsHeldAsync(
        AppDbContext dbContext,
        UserManager<Account> userManager,
        int adminRoleId,
        DateOnly today,
        CancellationToken ct
    )
    {
        var stillHeld = await dbContext.RoleHoldings.AnyAsync(
            holding =>
                holding.RoleId == adminRoleId
                && (holding.UntilOn == null || holding.UntilOn >= today),
            ct
        );

        if (stillHeld)
            return;

        var personId = await RequireBootstrapPersonIdAsync(userManager);
        dbContext.RoleHoldings.Add(
            new RoleHolding
            {
                RoleId = adminRoleId,
                PersonId = personId,
                SinceOn = today,
            }
        );
        await dbContext.SaveChangesAsync(ct);
        _logger.LogInformation(
            "Admin role {RoleId} handed back to bootstrap person {PersonId}",
            adminRoleId,
            personId
        );
    }

    private async Task<int> RequireBootstrapPersonIdAsync(UserManager<Account> userManager)
    {
        var account = await userManager.FindByEmailAsync(_options.Email);

        return account?.PersonId
            ?? throw new InvalidOperationException(
                $"The Admin role cannot be seeded: no Account exists for {_options.Email}."
            );
    }

    private static string Describe(IdentityResult result) =>
        string.Join(", ", result.Errors.Select(error => $"{error.Code}: {error.Description}"));
}
