namespace Furria.Application.Identity;

public sealed record AccountDetails
{
    public required int Id { get; init; }

    public required string Email { get; init; }

    public required PersonDetails Person { get; init; }

    public required MembershipDetails? Membership { get; init; }
}
