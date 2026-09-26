namespace Furria.Infrastructure.Identity;

public sealed record EmailConfirmationSubject
{
    public required EmailConfirmationPurpose Purpose { get; init; }

    public required int? InvitationId { get; init; }

    public int? AccountId { get; init; }

    public static EmailConfirmationSubject ForRedemption(int invitationId) =>
        new()
        {
            Purpose = EmailConfirmationPurpose.InvitationRedemption,
            InvitationId = invitationId,
        };

    public static EmailConfirmationSubject ForLoginEmailChange(int accountId) =>
        new()
        {
            Purpose = EmailConfirmationPurpose.LoginEmailChange,
            InvitationId = null,
            AccountId = accountId,
        };
}
