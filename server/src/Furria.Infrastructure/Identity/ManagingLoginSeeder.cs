using Furria.Application.Authorization;
using Furria.Application.Identity;
using Furria.Core.Roles;
using Furria.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.Identity;

public sealed class ManagingLoginSeeder : IHostedService
{
    private const string AdminRoleName = "Admin";
    private const string AdminRoleDescription =
        "Vollzugriff. Vom System angelegt, danach ganz normale Vereinsdaten.";

    private static readonly string AdminRoleNameLowered = AdminRoleName.ToLowerInvariant();

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ManagingLoginOptions _options;
    private readonly ILogger<ManagingLoginSeeder> _logger;

    public ManagingLoginSeeder(
        IServiceScopeFactory scopeFactory,
        IOptions<ManagingLoginOptions> options,
        ILogger<ManagingLoginSeeder> logger
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
            _logger.LogInformation("Managing login not configured, seeding skipped");
            return;
        }

        await using var scope = _scopeFactory.CreateAsyncScope();
        var seeding = new Seeding(
            scope.ServiceProvider.GetRequiredService<AppDbContext>(),
            scope.ServiceProvider.GetRequiredService<UserManager<Account>>(),
            scope.ServiceProvider.GetRequiredService<RefreshTokenService>(),
            cancellationToken
        );

        await using var transaction = await seeding.DbContext.Database.BeginTransactionAsync(
            cancellationToken
        );

        await EnsureManagingLoginAsync(seeding);
        await EnsureAdminRoleAsync(seeding);

        await transaction.CommitAsync(cancellationToken);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    private async Task EnsureManagingLoginAsync(Seeding seeding)
    {
        var managingLogin = await seeding.DbContext.Users.SingleOrDefaultAsync(
            account => account.IsManagingLogin,
            seeding.Ct
        );

        if (managingLogin is null)
        {
            if (await seeding.UserManager.FindByEmailAsync(_options.Email) is not { } formerAdmin)
            {
                await CreateManagingLoginAsync(seeding);
                return;
            }

            await ConvertFormerAdminAsync(seeding, formerAdmin);
            managingLogin = formerAdmin;
        }

        await MoveToConfiguredEmailAsync(seeding, managingLogin);
        await TakeConfiguredPasswordAsync(seeding, managingLogin);
        await ReopenAsync(seeding, managingLogin);
    }

    private async Task CreateManagingLoginAsync(Seeding seeding)
    {
        var account = new Account
        {
            UserName = _options.Email,
            Email = _options.Email,
            EmailConfirmed = true,
            IsManagingLogin = true,
        };

        Succeed(
            await seeding.UserManager.CreateAsync(account, _options.Password),
            "The managing login could not be created"
        );
        _logger.LogInformation("Managing login {AccountId} created", account.Id);
    }

    private async Task ConvertFormerAdminAsync(Seeding seeding, Account formerAdmin)
    {
        var formerPersonId = formerAdmin.PersonId;
        formerAdmin.PersonId = null;
        formerAdmin.IsManagingLogin = true;
        await seeding.DbContext.SaveChangesAsync(seeding.Ct);

        await seeding
            .DbContext.UserPasskeys.Where(passkey => passkey.UserId == formerAdmin.Id)
            .ExecuteDeleteAsync(seeding.Ct);
        await seeding.RefreshTokens.RevokeAllAsync(formerAdmin.Id, seeding.Ct);
        await seeding
            .DbContext.People.Where(person => person.Id == formerPersonId)
            .ExecuteDeleteAsync(seeding.Ct);

        _logger.LogInformation(
            "Account {AccountId} became the managing login, its person {PersonId} erased",
            formerAdmin.Id,
            formerPersonId
        );
    }

    private async Task MoveToConfiguredEmailAsync(Seeding seeding, Account managingLogin)
    {
        if (
            string.Equals(
                managingLogin.NormalizedEmail,
                seeding.UserManager.NormalizeEmail(_options.Email),
                StringComparison.Ordinal
            )
        )
            return;

        managingLogin.Email = _options.Email;
        managingLogin.UserName = _options.Email;
        managingLogin.EmailConfirmed = true;
        Succeed(
            await seeding.UserManager.UpdateAsync(managingLogin),
            "The managing login could not take the configured email"
        );
        _logger.LogInformation(
            "Managing login {AccountId} moved to the configured email",
            managingLogin.Id
        );
    }

    private async Task TakeConfiguredPasswordAsync(Seeding seeding, Account managingLogin)
    {
        if (await seeding.UserManager.CheckPasswordAsync(managingLogin, _options.Password))
            return;

        Succeed(
            await seeding.UserManager.RemovePasswordAsync(managingLogin),
            "The managing login's password could not be removed"
        );
        Succeed(
            await seeding.UserManager.AddPasswordAsync(managingLogin, _options.Password),
            "The managing login could not take the configured password"
        );
        await seeding.RefreshTokens.RevokeAllAsync(managingLogin.Id, seeding.Ct);
        _logger.LogInformation(
            "Managing login {AccountId} took the configured password, every session ended",
            managingLogin.Id
        );
    }

    private async Task ReopenAsync(Seeding seeding, Account managingLogin)
    {
        if (!managingLogin.IsDisabled)
            return;

        managingLogin.IsDisabled = false;
        await seeding.DbContext.SaveChangesAsync(seeding.Ct);
        _logger.LogInformation("Managing login {AccountId} re-enabled", managingLogin.Id);
    }

    private async Task EnsureAdminRoleAsync(Seeding seeding)
    {
        var adminRoleId = await seeding
            .DbContext.Roles.Where(role => role.Name.ToLower() == AdminRoleNameLowered)
            .Select(role => (int?)role.Id)
            .FirstOrDefaultAsync(seeding.Ct);

        if (adminRoleId is { } existing)
        {
            await ReopenAdminRoleAsync(seeding, existing);
            await GrantEveryMissingKeyAsync(seeding, existing);
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
        };

        seeding.DbContext.Roles.Add(role);
        await seeding.DbContext.SaveChangesAsync(seeding.Ct);
        _logger.LogInformation("Admin role {RoleId} created", role.Id);
    }

    private async Task ReopenAdminRoleAsync(Seeding seeding, int adminRoleId)
    {
        var role = await seeding.DbContext.Roles.SingleAsync(
            row => row.Id == adminRoleId,
            seeding.Ct
        );
        if (role.ArchivedOn is null)
            return;

        role.ArchivedOn = null;
        await seeding.DbContext.SaveChangesAsync(seeding.Ct);
        _logger.LogInformation("Admin role {RoleId} restored from archive", adminRoleId);
    }

    private async Task GrantEveryMissingKeyAsync(Seeding seeding, int adminRoleId)
    {
        var granted = await seeding
            .DbContext.RolePermissions.Where(permission => permission.RoleId == adminRoleId)
            .Select(permission => permission.PermissionKey)
            .ToListAsync(seeding.Ct);

        var missing = FurriaPermissions.All.Except(granted).ToList();
        if (missing.Count == 0)
            return;

        seeding.DbContext.RolePermissions.AddRange(
            missing.Select(key => new RolePermission { RoleId = adminRoleId, PermissionKey = key })
        );
        await seeding.DbContext.SaveChangesAsync(seeding.Ct);
        _logger.LogInformation(
            "Admin role {RoleId} granted {MissingPermissionCount} missing permissions",
            adminRoleId,
            missing.Count
        );
    }

    private static void Succeed(IdentityResult result, string failure)
    {
        if (result.Succeeded)
            return;

        throw new InvalidOperationException(
            $"{failure}: "
                + string.Join(
                    ", ",
                    result.Errors.Select(error => $"{error.Code}: {error.Description}")
                )
        );
    }

    private sealed record Seeding(
        AppDbContext DbContext,
        UserManager<Account> UserManager,
        RefreshTokenService RefreshTokens,
        CancellationToken Ct
    );
}
