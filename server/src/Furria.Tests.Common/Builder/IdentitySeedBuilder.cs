using Furria.Core.Identity;

namespace Furria.Tests.Common.Builder;

public sealed class IdentitySeedBuilder
{
    private static readonly DateOnly DefaultStartedAt = new(2020, 11, 11);

    private readonly List<PersonIntent> _people = [];
    private readonly List<PersonContactIntent> _contacts = [];
    private readonly List<MembershipIntent> _memberships = [];
    private readonly List<MembershipPauseIntent> _pauses = [];
    private readonly List<FeeReductionIntent> _feeReductions = [];
    private readonly List<AccountIntent> _accounts = [];

    internal IReadOnlyList<PersonIntent> People => _people;

    internal IReadOnlyList<PersonContactIntent> Contacts => _contacts;

    internal IReadOnlyList<MembershipIntent> Memberships => _memberships;

    internal IReadOnlyList<MembershipPauseIntent> Pauses => _pauses;

    internal IReadOnlyList<FeeReductionIntent> FeeReductions => _feeReductions;

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

    public IdentitySeedBuilder AddPersonContact(
        string alias,
        string? email = null,
        string? phone = null,
        string? street = null,
        string? zip = null,
        string? city = null,
        bool contactVisibleToMembers = false,
        DateOnly? birthDate = null
    )
    {
        _contacts.Add(
            new PersonContactIntent(
                alias,
                email,
                phone,
                street,
                zip,
                city,
                contactVisibleToMembers,
                birthDate
            )
        );
        return this;
    }

    public IdentitySeedBuilder AddAccount(string alias, bool disabled = false)
    {
        _accounts.Add(new AccountIntent(alias, disabled));
        return this;
    }

    public IdentitySeedBuilder AddMembership(
        string alias,
        string personAlias,
        DateOnly? startedOn = null,
        DateOnly? endedOn = null
    )
    {
        _memberships.Add(
            new MembershipIntent(alias, personAlias, startedOn ?? DefaultStartedAt, endedOn)
        );
        return this;
    }

    public IdentitySeedBuilder AddMembershipPause(
        string alias,
        string membershipAlias,
        int firstSessionYear,
        int? lastSessionYear = null
    )
    {
        _pauses.Add(
            new MembershipPauseIntent(alias, membershipAlias, firstSessionYear, lastSessionYear)
        );
        return this;
    }

    public IdentitySeedBuilder AddFeeReduction(
        string alias,
        string personAlias,
        FeeReductionBasis basis,
        int firstSessionYear,
        int lastSessionYear
    )
    {
        _feeReductions.Add(
            new FeeReductionIntent(alias, personAlias, basis, firstSessionYear, lastSessionYear)
        );
        return this;
    }

    internal sealed record PersonIntent(string Alias, string FirstName, string LastName);

    internal sealed record PersonContactIntent(
        string Alias,
        string? Email,
        string? Phone,
        string? Street,
        string? Zip,
        string? City,
        bool ContactVisibleToMembers,
        DateOnly? BirthDate
    );

    internal sealed record MembershipIntent(
        string Alias,
        string PersonAlias,
        DateOnly StartedOn,
        DateOnly? EndedOn
    );

    internal sealed record MembershipPauseIntent(
        string Alias,
        string MembershipAlias,
        int FirstSessionYear,
        int? LastSessionYear
    );

    internal sealed record FeeReductionIntent(
        string Alias,
        string PersonAlias,
        FeeReductionBasis Basis,
        int FirstSessionYear,
        int LastSessionYear
    );

    internal sealed record AccountIntent(string Alias, bool Disabled);
}
