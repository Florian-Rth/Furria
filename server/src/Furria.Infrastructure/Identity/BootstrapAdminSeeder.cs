using Furria.Application.Authorization;
using Furria.Application.Identity;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Core.Roles;
using Furria.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.Identity;

public sealed class BootstrapAdminSeeder : IHostedService
{
    private const string AdminRoleName = "Admin";
    private const string AdminRoleDescription =
        "Vollzugriff. Vom System angelegt, danach ganz normale Vereinsdaten.";

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly BootstrapAdminOptions _options;

    public BootstrapAdminSeeder(
        IServiceScopeFactory scopeFactory,
        IOptions<BootstrapAdminOptions> options
    )
    {
        _scopeFactory = scopeFactory;
        _options = options.Value;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        if (_options.Email.Length == 0 || _options.Password.Length == 0)
            return;

        await using var scope = _scopeFactory.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        await using var transaction = await dbContext.Database.BeginTransactionAsync(
            cancellationToken
        );

        await EnsureBootstrapAccountAsync(
            dbContext,
            scope.ServiceProvider.GetRequiredService<UserManager<Account>>(),
            transaction,
            cancellationToken
        );
        await EnsureAdminRoleAsync(
            dbContext,
            scope.ServiceProvider.GetRequiredService<TimeProvider>(),
            cancellationToken
        );

        await transaction.CommitAsync(cancellationToken);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    private async Task EnsureBootstrapAccountAsync(
        AppDbContext dbContext,
        UserManager<Account> userManager,
        Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction transaction,
        CancellationToken ct
    )
    {
        if (await dbContext.Users.AnyAsync(account => account.Email == _options.Email, ct))
            return;

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
            return;

        await transaction.RollbackAsync(ct);
        throw new InvalidOperationException(
            $"The bootstrap admin could not be created: {Describe(created)}"
        );
    }

    private async Task EnsureAdminRoleAsync(
        AppDbContext dbContext,
        TimeProvider timeProvider,
        CancellationToken ct
    )
    {
        if (
            await dbContext.Roles.AnyAsync(role => EF.Functions.ILike(role.Name, AdminRoleName), ct)
        )
            return;

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
                    PersonId = await RequireBootstrapPersonIdAsync(dbContext, ct),
                    SinceOn = ClubClock.Today(timeProvider),
                },
            ],
        };

        dbContext.Roles.Add(role);
        await dbContext.SaveChangesAsync(ct);
    }

    private async Task<int> RequireBootstrapPersonIdAsync(
        AppDbContext dbContext,
        CancellationToken ct
    )
    {
        var personId = await dbContext
            .Users.Where(account => account.Email == _options.Email)
            .Select(account => (int?)account.PersonId)
            .SingleOrDefaultAsync(ct);

        return personId
            ?? throw new InvalidOperationException(
                $"The Admin Rolle cannot be seeded: no Account exists for {_options.Email}."
            );
    }

    private static string Describe(IdentityResult result) =>
        string.Join(", ", result.Errors.Select(error => $"{error.Code}: {error.Description}"));
}
