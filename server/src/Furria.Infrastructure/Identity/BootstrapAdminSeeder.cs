using Furria.Application.Identity;
using Furria.Core.Identity;
using Furria.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace Furria.Infrastructure.Identity;

public sealed class BootstrapAdminSeeder : IHostedService
{
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

        if (await dbContext.Users.AnyAsync(cancellationToken))
            return;

        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<Account>>();
        await SeedAsync(dbContext, userManager, cancellationToken);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    private async Task SeedAsync(
        AppDbContext dbContext,
        UserManager<Account> userManager,
        CancellationToken ct
    )
    {
        await using var transaction = await dbContext.Database.BeginTransactionAsync(ct);

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
        if (!created.Succeeded)
        {
            await transaction.RollbackAsync(ct);
            throw new InvalidOperationException(
                $"The bootstrap admin could not be created: {Describe(created)}"
            );
        }

        await transaction.CommitAsync(ct);
    }

    private static string Describe(IdentityResult result) =>
        string.Join(", ", result.Errors.Select(error => $"{error.Code}: {error.Description}"));
}
