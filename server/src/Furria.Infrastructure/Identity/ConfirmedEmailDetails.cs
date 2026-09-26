namespace Furria.Infrastructure.Identity;

public sealed record ConfirmedEmailDetails
{
    public required EmailConfirmationVerdict Verdict { get; init; }

    public required string? Email { get; init; }

    public required bool UpdatesContactEmail { get; init; }

    public static ConfirmedEmailDetails Confirmed(string email, bool updatesContactEmail) =>
        new()
        {
            Verdict = EmailConfirmationVerdict.Confirmed,
            Email = email,
            UpdatesContactEmail = updatesContactEmail,
        };

    public static ConfirmedEmailDetails Refused(EmailConfirmationVerdict verdict) =>
        new()
        {
            Verdict = verdict,
            Email = null,
            UpdatesContactEmail = false,
        };
}
