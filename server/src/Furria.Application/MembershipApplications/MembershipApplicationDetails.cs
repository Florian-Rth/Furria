namespace Furria.Application.MembershipApplications;

public sealed record MembershipApplicationDetails
{
    public required int MembershipApplicationId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required DateOnly BirthDate { get; init; }

    public required int Age { get; init; }

    public required bool IsMinor { get; init; }

    public required string Street { get; init; }

    public required string Zip { get; init; }

    public required string City { get; init; }

    public required string Email { get; init; }

    public required string? Phone { get; init; }

    public required DateTimeOffset SubmittedAt { get; init; }

    public required DateTimeOffset ConfirmedAt { get; init; }

    public required DateOnly AppliedOn { get; init; }

    public required int AgeOfConsent { get; init; }

    public required IReadOnlyList<AdmissionCandidate> Candidates { get; init; }
}
