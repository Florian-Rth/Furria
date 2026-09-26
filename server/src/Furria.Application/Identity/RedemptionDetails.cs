namespace Furria.Application.Identity;

public sealed record RedemptionDetails
{
    public required RedemptionOutcome Outcome { get; init; }

    public SessionTokensDetails? Session { get; init; }

    public DateTimeOffset? ConfirmationExpiresAt { get; init; }

    public static RedemptionDetails Refused(RedemptionOutcome outcome) =>
        new() { Outcome = outcome };

    public static RedemptionDetails Redeemed(SessionTokensDetails session) =>
        new() { Outcome = RedemptionOutcome.Redeemed, Session = session };

    public static RedemptionDetails ConfirmationRequired(DateTimeOffset expiresAt) =>
        new()
        {
            Outcome = RedemptionOutcome.ConfirmationRequired,
            ConfirmationExpiresAt = expiresAt,
        };
}
