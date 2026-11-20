namespace Furria.Tests.Common.Builder;

public sealed class IntakeSeedBuilder
{
    private readonly List<IntakeIntent> _intakes = [];

    internal IReadOnlyList<IntakeIntent> Intakes => _intakes;

    public IntakeSeedBuilder AddIntake(
        string alias,
        string? starterAlias = null,
        DateOnly? memberFrom = null,
        IReadOnlyList<string>? groupAliases = null,
        string? label = null,
        DateTimeOffset? expiresAt = null,
        (string FirstName, string LastName)? submittedName = null,
        string? completedAsPersonAlias = null,
        DateTimeOffset? discardedAt = null
    )
    {
        _intakes.Add(
            new IntakeIntent(
                alias,
                starterAlias,
                memberFrom,
                groupAliases ?? [],
                label,
                expiresAt,
                submittedName,
                completedAsPersonAlias,
                discardedAt
            )
        );
        return this;
    }

    internal sealed record IntakeIntent(
        string Alias,
        string? StarterAlias,
        DateOnly? MemberFrom,
        IReadOnlyList<string> GroupAliases,
        string? Label,
        DateTimeOffset? ExpiresAt,
        (string FirstName, string LastName)? SubmittedName,
        string? CompletedAsPersonAlias,
        DateTimeOffset? DiscardedAt
    );
}
