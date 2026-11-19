using System.Text;
using Furria.Core.Intakes;
using Furria.Infrastructure.Intakes;
using Furria.Infrastructure.Persistence;
using Furria.Tests.Common.Fixtures;

namespace Furria.Tests.Common.Builder;

internal static class IntakeSeedMaterializer
{
    private const string PersonKind = "Person";
    private const string GroupKind = "Group";

    private static readonly byte[] SigningKey = Encoding.UTF8.GetBytes(ApiTestFixture.SigningKey);
    private static readonly TimeSpan SeededSubmissionAge = TimeSpan.FromHours(1);

    internal static async Task<SeededIntakes> InsertAsync(
        AppDbContext dbContext,
        IntakeSeedBuilder recorded,
        IReadOnlyDictionary<string, int> personIds,
        IReadOnlyDictionary<string, int> groupIds,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        var intakes = recorded.Intakes.ToDictionary(
            intent => intent.Alias,
            intent => NewIntake(intent, personIds, groupIds, now),
            StringComparer.Ordinal
        );
        dbContext.Intakes.AddRange(intakes.Values);
        await dbContext.SaveChangesAsync(ct);
        foreach (var intent in recorded.Intakes.Where(intent => intent.ExpiresAt is not null))
            Backdate(intakes[intent.Alias], intent.ExpiresAt!.Value);
        await dbContext.SaveChangesAsync(ct);

        return new SeededIntakes(
            intakes.ToDictionary(entry => entry.Key, entry => entry.Value.Id),
            intakes.ToDictionary(
                entry => entry.Key,
                entry => IntakeTokens.TokenOf(SigningKey, SeedOf(entry.Key))
            )
        );
    }

    private static Intake NewIntake(
        IntakeSeedBuilder.IntakeIntent intent,
        IReadOnlyDictionary<string, int> personIds,
        IReadOnlyDictionary<string, int> groupIds,
        DateTimeOffset now
    )
    {
        var seed = SeedOf(intent.Alias);
        var isPending = intent.CompletedAsPersonAlias is null && intent.DiscardedAt is null;
        var held = isPending ? intent.SubmittedName : null;

        return new Intake
        {
            StartedByPersonId = intent.StarterAlias is { } starterAlias
                ? SeedAliases.RequireId(personIds, starterAlias, PersonKind)
                : null,
            MemberFrom = intent.MemberFrom,
            Label = intent.Label,
            TokenSeed = isPending ? seed : null,
            TokenHash = IntakeTokens.HashOf(SigningKey, seed),
            ExpiresAt = Intake.ExpiryFor(now),
            SubmittedAt =
                intent.SubmittedName is not null || intent.CompletedAsPersonAlias is not null
                    ? now - SeededSubmissionAge
                    : null,
            CompletedAt = intent.CompletedAsPersonAlias is null ? null : now,
            PersonId = intent.CompletedAsPersonAlias is { } personAlias
                ? SeedAliases.RequireId(personIds, personAlias, PersonKind)
                : null,
            DiscardedAt = intent.DiscardedAt,
            FirstName = held?.FirstName,
            LastName = held?.LastName,
            BirthDate = held is null ? null : new DateOnly(2001, 4, 12),
            Groups =
            [
                .. intent.GroupAliases.Select(groupAlias => new IntakeGroup
                {
                    GroupId = SeedAliases.RequireId(groupIds, groupAlias, GroupKind),
                }),
            ],
        };
    }

    private static string SeedOf(string alias) =>
        $"seed-{alias}".PadRight(Intake.SeedLength, '0')[..Intake.SeedLength];

    private static void Backdate(Intake intake, DateTimeOffset expiresAt)
    {
        intake.CreatedAt = expiresAt - Intake.Lifetime;
        intake.ExpiresAt = expiresAt;
    }
}
