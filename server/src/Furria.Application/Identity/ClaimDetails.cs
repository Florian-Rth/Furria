namespace Furria.Application.Identity;

public sealed record ClaimDetails
{
    public required ClaimOutcome Outcome { get; init; }

    public required string? Token { get; init; }

    public static ClaimDetails Refused(ClaimOutcome outcome) =>
        new() { Outcome = outcome, Token = null };

    public static ClaimDetails Invited(string token) =>
        new() { Outcome = ClaimOutcome.Invited, Token = token };
}
