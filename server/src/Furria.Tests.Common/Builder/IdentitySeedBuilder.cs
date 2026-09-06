using Furria.Core.Identity;

namespace Furria.Tests.Common.Builder;

public sealed class IdentitySeedBuilder
{
    private static readonly DateOnly DefaultStartedAt = new(2020, 11, 11);

    private readonly List<PersonIntent> _people = [];
    private readonly List<MembershipIntent> _memberships = [];
    private readonly List<AccountIntent> _accounts = [];

    internal IReadOnlyList<PersonIntent> People => _people;

    internal IReadOnlyList<MembershipIntent> Memberships => _memberships;

    internal IReadOnlyList<AccountIntent> Accounts => _accounts;

    public IdentitySeedBuilder AddPerson(
        string alias,
        string firstName = "Test",
        string lastName = "Person"
    )
    {
        _people.Add(new PersonIntent(alias, firstName, lastName));
        return this;
    }

    public IdentitySeedBuilder AddMembership(
        string alias,
        MembershipType type = MembershipType.Active,
        MembershipStatus status = MembershipStatus.Active,
        DateOnly? startedAt = null,
        DateOnly? endedAt = null
    )
    {
        _memberships.Add(
            new MembershipIntent(alias, type, status, startedAt ?? DefaultStartedAt, endedAt)
        );
        return this;
    }

    public IdentitySeedBuilder AddAccount(string alias, bool disabled = false)
    {
        _accounts.Add(new AccountIntent(alias, disabled));
        return this;
    }

    internal sealed record PersonIntent(string Alias, string FirstName, string LastName);

    internal sealed record MembershipIntent(
        string Alias,
        MembershipType Type,
        MembershipStatus Status,
        DateOnly StartedAt,
        DateOnly? EndedAt
    );

    internal sealed record AccountIntent(string Alias, bool Disabled);
}
