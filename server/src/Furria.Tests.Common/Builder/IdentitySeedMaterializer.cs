using Furria.Core.Identity;
using Furria.Infrastructure.Identity;
using Furria.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace Furria.Tests.Common.Builder;

internal static class IdentitySeedMaterializer
{
    private static string? _cachedPasswordHash;

    internal static async Task<SeededIdentity> MaterializeAsync(
        IServiceScopeFactory scopeFactory,
        IdentitySeedBuilder recorded,
        string password,
        CancellationToken ct
    )
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var credentials = Credentials(
            recorded,
            scope.ServiceProvider.GetRequiredService<ILookupNormalizer>(),
            PasswordHash(
                scope.ServiceProvider.GetRequiredService<IPasswordHasher<Account>>(),
                password
            )
        );

        var personIds = await InsertPeopleAsync(dbContext, recorded, ct);
        await InsertMembershipsAsync(dbContext, recorded, personIds, ct);
        var accounts = await InsertAccountsAsync(dbContext, recorded, personIds, credentials, ct);

        return new SeededIdentity(personIds, accounts.Ids, accounts.Emails);
    }

    private static async Task<Dictionary<string, int>> InsertPeopleAsync(
        AppDbContext dbContext,
        IdentitySeedBuilder recorded,
        CancellationToken ct
    )
    {
        var declared = recorded.People.ToDictionary(intent => intent.Alias);
        var aliases = recorded
            .People.Select(intent => intent.Alias)
            .Concat(recorded.Accounts.Select(intent => intent.Alias))
            .Distinct(StringComparer.Ordinal)
            .ToList();

        var people = aliases.ToDictionary(
            alias => alias,
            alias => new Person
            {
                FirstName = declared.TryGetValue(alias, out var intent) ? intent.FirstName : "Test",
                LastName = declared.TryGetValue(alias, out var named) ? named.LastName : "Person",
                Email = $"{alias}-{Guid.NewGuid():N}@test.local",
            },
            StringComparer.Ordinal
        );

        dbContext.People.AddRange(people.Values);
        await dbContext.SaveChangesAsync(ct);

        return people.ToDictionary(
            entry => entry.Key,
            entry => entry.Value.Id,
            StringComparer.Ordinal
        );
    }

    private static async Task InsertMembershipsAsync(
        AppDbContext dbContext,
        IdentitySeedBuilder recorded,
        IReadOnlyDictionary<string, int> personIds,
        CancellationToken ct
    )
    {
        if (recorded.Memberships.Count == 0)
            return;

        dbContext.Memberships.AddRange(
            recorded.Memberships.Select(intent => new Membership
            {
                PersonId = RequirePerson(personIds, intent.Alias),
                Type = intent.Type,
                Status = intent.Status,
                StartedAt = intent.StartedAt,
                EndedAt = intent.EndedAt,
            })
        );

        await dbContext.SaveChangesAsync(ct);
    }

    private static async Task<SeededAccounts> InsertAccountsAsync(
        AppDbContext dbContext,
        IdentitySeedBuilder recorded,
        IReadOnlyDictionary<string, int> personIds,
        IReadOnlyDictionary<string, AccountCredential> credentials,
        CancellationToken ct
    )
    {
        if (recorded.Accounts.Count == 0)
            return new SeededAccounts(
                new Dictionary<string, int>(StringComparer.Ordinal),
                new Dictionary<string, string>(StringComparer.Ordinal)
            );

        var accounts = recorded.Accounts.ToDictionary(
            intent => intent.Alias,
            intent => Build(intent, personIds, credentials[intent.Alias]),
            StringComparer.Ordinal
        );

        dbContext.Users.AddRange(accounts.Values);
        await dbContext.SaveChangesAsync(ct);

        return new SeededAccounts(
            accounts.ToDictionary(
                entry => entry.Key,
                entry => entry.Value.Id,
                StringComparer.Ordinal
            ),
            accounts.ToDictionary(
                entry => entry.Key,
                entry => entry.Value.Email!,
                StringComparer.Ordinal
            )
        );
    }

    private static Dictionary<string, AccountCredential> Credentials(
        IdentitySeedBuilder recorded,
        ILookupNormalizer normalizer,
        string passwordHash
    ) =>
        recorded.Accounts.ToDictionary(
            intent => intent.Alias,
            intent =>
                Credential(
                    $"{intent.Alias}-{Guid.NewGuid():N}@test.local",
                    normalizer,
                    passwordHash
                ),
            StringComparer.Ordinal
        );

    private static AccountCredential Credential(
        string email,
        ILookupNormalizer normalizer,
        string passwordHash
    ) =>
        new(email, normalizer.NormalizeName(email), normalizer.NormalizeEmail(email), passwordHash);

    private static Account Build(
        IdentitySeedBuilder.AccountIntent intent,
        IReadOnlyDictionary<string, int> personIds,
        AccountCredential credential
    ) =>
        new()
        {
            PersonId = RequirePerson(personIds, intent.Alias),
            IsDisabled = intent.Disabled,
            UserName = credential.Email,
            NormalizedUserName = credential.NormalizedUserName,
            Email = credential.Email,
            NormalizedEmail = credential.NormalizedEmail,
            EmailConfirmed = true,
            PasswordHash = credential.PasswordHash,
            SecurityStamp = Guid.NewGuid().ToString("N"),
            ConcurrencyStamp = Guid.NewGuid().ToString("N"),
            LockoutEnabled = true,
        };

    private static string PasswordHash(IPasswordHasher<Account> hasher, string password) =>
        _cachedPasswordHash ??= hasher.HashPassword(new Account(), password);

    private static int RequirePerson(IReadOnlyDictionary<string, int> personIds, string alias) =>
        personIds.TryGetValue(alias, out var id)
            ? id
            : throw new KeyNotFoundException(
                $"No Person was seeded for alias \"{alias}\". Declared aliases: "
                    + $"{string.Join(", ", personIds.Keys)}."
            );

    private sealed record AccountCredential(
        string Email,
        string NormalizedUserName,
        string NormalizedEmail,
        string PasswordHash
    );

    private sealed record SeededAccounts(
        IReadOnlyDictionary<string, int> Ids,
        IReadOnlyDictionary<string, string> Emails
    );
}
