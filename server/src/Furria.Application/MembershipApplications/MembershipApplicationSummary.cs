namespace Furria.Application.MembershipApplications;

public sealed record MembershipApplicationSummary
{
    public required int MembershipApplicationId { get; init; }

    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required int Age { get; init; }

    public required bool IsMinor { get; init; }

    public required string City { get; init; }

    public required DateTimeOffset ConfirmedAt { get; init; }
}
