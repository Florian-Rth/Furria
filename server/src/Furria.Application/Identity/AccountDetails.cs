namespace Furria.Application.Identity;

public sealed record AccountDetails
{
    public required int Id { get; init; }

    public required string Email { get; init; }

    public required PersonDetails Person { get; init; }

    public required MembershipChainDetails Membership { get; init; }

    public required IReadOnlyList<string> PermissionKeys { get; init; }
}
