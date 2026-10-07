using Furria.Core.Identity;

namespace Furria.Tests.Common.Builder;

public sealed class IdentitySeedBuilder
{
    private const string DefaultApplicantFirstName = "Mia";
    private const string DefaultApplicantLastName = "Schwarzwälder";
    private const string DefaultApplicantPhone = "0221 987654";

    private static readonly DateOnly DefaultStartedAt = new(2020, 11, 11);

    private readonly List<PersonIntent> _people = [];
    private readonly List<PersonContactIntent> _contacts = [];
    private readonly List<ContactChangeIntent> _contactChanges = [];
    private readonly List<ArchiveIntent> _archives = [];
    private readonly List<MembershipIntent> _memberships = [];
    private readonly List<AdmissionIntent> _admissions = [];
    private readonly List<MembershipPauseIntent> _pauses = [];
    private readonly List<FeeReductionIntent> _feeReductions = [];
    private readonly List<AccountIntent> _accounts = [];
    private readonly List<MembershipApplicationIntent> _membershipApplications = [];

    internal IReadOnlyList<PersonIntent> People => _people;

    internal IReadOnlyList<PersonContactIntent> Contacts => _contacts;

    internal IReadOnlyList<ContactChangeIntent> ContactChanges => _contactChanges;

    internal IReadOnlyList<ArchiveIntent> Archives => _archives;

    internal IReadOnlyList<MembershipIntent> Memberships => _memberships;

    internal IReadOnlyList<AdmissionIntent> Admissions => _admissions;

    internal IReadOnlyList<MembershipPauseIntent> Pauses => _pauses;

    internal IReadOnlyList<FeeReductionIntent> FeeReductions => _feeReductions;

    internal IReadOnlyList<AccountIntent> Accounts => _accounts;

    internal IReadOnlyList<MembershipApplicationIntent> MembershipApplications =>
        _membershipApplications;

    public IdentitySeedBuilder AddPerson(
        string alias,
        string firstName = "Test",
        string lastName = "Person",
        string? portraitUrl = null
    )
    {
        _people.Add(new PersonIntent(alias, firstName, lastName, portraitUrl));
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
        DateOnly? birthDate = null,
        bool withoutEmail = false
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
                birthDate,
                withoutEmail
            )
        );
        return this;
    }

    public IdentitySeedBuilder AddContactChange(
        string personAlias,
        string changedByAlias,
        DateTimeOffset changedAt
    )
    {
        _contactChanges.Add(new ContactChangeIntent(personAlias, changedByAlias, changedAt));
        return this;
    }

    public IdentitySeedBuilder AddArchive(
        string personAlias,
        DateOnly archivedOn,
        string? archivedByAlias = null
    )
    {
        _archives.Add(new ArchiveIntent(personAlias, archivedOn, archivedByAlias));
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

    public IdentitySeedBuilder AddAdmission(
        string membershipAlias,
        string admittedByAlias,
        DateTimeOffset admittedAt,
        bool guardianConsentConfirmed = false
    )
    {
        _admissions.Add(
            new AdmissionIntent(
                membershipAlias,
                admittedByAlias,
                admittedAt,
                guardianConsentConfirmed
            )
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

    public IdentitySeedBuilder AddMembershipApplication(
        string alias,
        DateOnly birthDate,
        string firstName = DefaultApplicantFirstName,
        string lastName = DefaultApplicantLastName,
        string? email = null,
        string? phone = DefaultApplicantPhone,
        DateTimeOffset? confirmedAt = null,
        bool unconfirmed = false
    )
    {
        _membershipApplications.Add(
            new MembershipApplicationIntent(
                alias,
                birthDate,
                firstName,
                lastName,
                email,
                phone,
                confirmedAt,
                unconfirmed
            )
        );
        return this;
    }

    internal sealed record PersonIntent(
        string Alias,
        string FirstName,
        string LastName,
        string? PortraitUrl
    );

    internal sealed record PersonContactIntent(
        string Alias,
        string? Email,
        string? Phone,
        string? Street,
        string? Zip,
        string? City,
        bool ContactVisibleToMembers,
        DateOnly? BirthDate,
        bool WithoutEmail
    );

    internal sealed record ContactChangeIntent(
        string PersonAlias,
        string ChangedByAlias,
        DateTimeOffset ChangedAt
    );

    internal sealed record ArchiveIntent(
        string PersonAlias,
        DateOnly ArchivedOn,
        string? ArchivedByAlias
    );

    internal sealed record MembershipIntent(
        string Alias,
        string PersonAlias,
        DateOnly StartedOn,
        DateOnly? EndedOn
    );

    internal sealed record AdmissionIntent(
        string MembershipAlias,
        string AdmittedByAlias,
        DateTimeOffset AdmittedAt,
        bool GuardianConsentConfirmed
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

    internal sealed record MembershipApplicationIntent(
        string Alias,
        DateOnly BirthDate,
        string FirstName,
        string LastName,
        string? Email,
        string? Phone,
        DateTimeOffset? ConfirmedAt,
        bool Unconfirmed
    );
}
