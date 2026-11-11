using Furria.Core.GroupMatcher;

namespace Furria.Tests.Common.Builder;

public sealed class GroupMatcherSeedBuilder
{
    public const int DefaultImportance = 2;

    private readonly List<StatementIntent> _statements = [];
    private readonly List<StanceIntent> _stances = [];
    private readonly List<AdmissionAgeIntent> _admissionAges = [];
    private readonly List<TakingPartIntent> _takingPart = [];

    internal IReadOnlyList<StatementIntent> Statements => _statements;

    internal IReadOnlyList<StanceIntent> Stances => _stances;

    internal IReadOnlyList<AdmissionAgeIntent> AdmissionAges => _admissionAges;

    internal IReadOnlyList<TakingPartIntent> TakingPart => _takingPart;

    public GroupMatcherSeedBuilder AddStatement(
        string alias,
        string text,
        DateTimeOffset? addedAt = null,
        DateTimeOffset? rewordedAt = null
    )
    {
        _statements.Add(new StatementIntent(alias, text, addedAt, rewordedAt));
        return this;
    }

    public GroupMatcherSeedBuilder AddStance(
        string groupAlias,
        string statementAlias,
        StancePosition position,
        int importance = DefaultImportance,
        DateTimeOffset? takenAt = null
    )
    {
        _stances.Add(new StanceIntent(groupAlias, statementAlias, position, importance, takenAt));
        return this;
    }

    public GroupMatcherSeedBuilder AddAdmissionAge(string groupAlias, AdmissionAgeBand band)
    {
        _admissionAges.Add(new AdmissionAgeIntent(groupAlias, band));
        return this;
    }

    public GroupMatcherSeedBuilder AddTakingPart(string groupAlias, DateTimeOffset? joinedAt = null)
    {
        _takingPart.Add(new TakingPartIntent(groupAlias, joinedAt));
        return this;
    }

    internal sealed record StatementIntent(
        string Alias,
        string Text,
        DateTimeOffset? AddedAt,
        DateTimeOffset? RewordedAt
    );

    internal sealed record StanceIntent(
        string GroupAlias,
        string StatementAlias,
        StancePosition Position,
        int Importance,
        DateTimeOffset? TakenAt
    );

    internal sealed record AdmissionAgeIntent(string GroupAlias, AdmissionAgeBand Band);

    internal sealed record TakingPartIntent(string GroupAlias, DateTimeOffset? JoinedAt);
}
