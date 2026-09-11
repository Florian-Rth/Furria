using Furria.Core.Identity;
using Furria.Infrastructure.Identity;
using Furria.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace Furria.Tests.Common.Builder;

internal static class IdentitySeedMaterializer
{
    private static string? _cachedPasswordHash;

    internal static async Task<SeededIdentity> InsertAsync(
        IServiceProvider services,
        AppDbContext dbContext,
        IdentitySeedBuilder recorded,
        string password,
        CancellationToken ct
    )
    {
        var credentials = Credentials(
            recorded,
            services.GetRequiredService<ILookupNormalizer>(),
            PasswordHash(services.GetRequiredService<IPasswordHasher<Account>>(), password)
        );

        var personIds = await InsertPeopleAsync(dbContext, recorded, ct);
        var membershipIds = await InsertMembershipsAsync(dbContext, recorded, personIds, ct);
        var pauseIds = await InsertPausesAsync(dbContext, recorded, membershipIds, ct);
        var feeReductionIds = await InsertFeeReductionsAsync(dbContext, recorded, personIds, ct);
        var accounts = await InsertAccountsAsync(dbContext, recorded, personIds, credentials, ct);

        return new SeededIdentity(
            personIds,
            membershipIds,
            pauseIds,
            feeReductionIds,
            accounts.Ids,
            accounts.Emails
        );
    }

    private static async Task<Dictionary<string, int>> InsertPeopleAsync(
        AppDbContext dbContext,
        IdentitySeedBuilder recorded,
        CancellationToken ct
    )
    {
        var declared = recorded.People.ToDictionary(intent => intent.Alias, StringComparer.Ordinal);
        var contacts = recorded.Contacts.ToDictionary(
            intent => intent.Alias,
            StringComparer.Ordinal
        );
        var aliases = recorded
            .People.Select(intent => intent.Alias)
            .Concat(recorded.Contacts.Select(intent => intent.Alias))
            .Concat(recorded.Accounts.Select(intent => intent.Alias))
            .Distinct(StringComparer.Ordinal)
            .ToList();

        var people = aliases.ToDictionary(
            alias => alias,
            alias =>
                Build(alias, declared.GetValueOrDefault(alias), contacts.GetValueOrDefault(alias)),
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

    private static Person Build(
        string alias,
        IdentitySeedBuilder.PersonIntent? named,
        IdentitySeedBuilder.PersonContactIntent? contact
    ) =>
        new()
        {
            FirstName = named?.FirstName ?? "Test",
            LastName = named?.LastName ?? "Person",
            Email = contact?.Email ?? $"{alias}-{Guid.NewGuid():N}@test.local",
            Phone = contact?.Phone,
            Street = contact?.Street,
            Zip = contact?.Zip,
            City = contact?.City,
            BirthDate = contact?.BirthDate,
            ContactVisibleToMembers = contact?.ContactVisibleToMembers ?? false,
        };

    private static async Task<Dictionary<string, int>> InsertMembershipsAsync(
        AppDbContext dbContext,
        IdentitySeedBuilder recorded,
        IReadOnlyDictionary<string, int> personIds,
        CancellationToken ct
    )
    {
        var memberships = recorded.Memberships.ToDictionary(
            intent => intent.Alias,
            intent => new Membership
            {
                PersonId = SeedAliases.RequireId(personIds, intent.PersonAlias, "Person"),
                StartedOn = intent.StartedOn,
                EndedOn = intent.EndedOn,
            },
            StringComparer.Ordinal
        );

        if (memberships.Count > 0)
        {
            dbContext.Memberships.AddRange(memberships.Values);
            await dbContext.SaveChangesAsync(ct);
        }

        return memberships.ToDictionary(
            entry => entry.Key,
            entry => entry.Value.Id,
            StringComparer.Ordinal
        );
    }

    private static async Task<Dictionary<string, int>> InsertPausesAsync(
        AppDbContext dbContext,
        IdentitySeedBuilder recorded,
        IReadOnlyDictionary<string, int> membershipIds,
        CancellationToken ct
    )
    {
        var pauses = recorded.Pauses.ToDictionary(
            intent => intent.Alias,
            intent => new MembershipPause
            {
                MembershipId = SeedAliases.RequireId(
                    membershipIds,
                    intent.MembershipAlias,
                    "Mitgliedschaft"
                ),
                FirstSessionYear = intent.FirstSessionYear,
                LastSessionYear = intent.LastSessionYear,
            },
            StringComparer.Ordinal
        );

        if (pauses.Count > 0)
        {
            dbContext.MembershipPauses.AddRange(pauses.Values);
            await dbContext.SaveChangesAsync(ct);
        }

        return pauses.ToDictionary(
            entry => entry.Key,
            entry => entry.Value.Id,
            StringComparer.Ordinal
        );
    }

    private static async Task<Dictionary<string, int>> InsertFeeReductionsAsync(
        AppDbContext dbContext,
        IdentitySeedBuilder recorded,
        IReadOnlyDictionary<string, int> personIds,
        CancellationToken ct
    )
    {
        var reductions = recorded.FeeReductions.ToDictionary(
            intent => intent.Alias,
            intent => new FeeReduction
            {
                PersonId = SeedAliases.RequireId(personIds, intent.PersonAlias, "Person"),
                Basis = intent.Basis,
                FirstSessionYear = intent.FirstSessionYear,
                LastSessionYear = intent.LastSessionYear,
            },
            StringComparer.Ordinal
        );

        if (reductions.Count > 0)
        {
            dbContext.FeeReductions.AddRange(reductions.Values);
            await dbContext.SaveChangesAsync(ct);
        }

        return reductions.ToDictionary(
            entry => entry.Key,
            entry => entry.Value.Id,
            StringComparer.Ordinal
        );
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
            PersonId = SeedAliases.RequireId(personIds, intent.Alias, "Person"),
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
