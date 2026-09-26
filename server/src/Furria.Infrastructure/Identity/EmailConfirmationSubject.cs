namespace Furria.Infrastructure.Identity;

public sealed record EmailConfirmationSubject
{
    public required EmailConfirmationPurpose Purpose { get; init; }

    public required int? InvitationId { get; init; }

    public static EmailConfirmationSubject ForRedemption(int invitationId) =>
        new()
        {
            Purpose = EmailConfirmationPurpose.InvitationRedemption,
            InvitationId = invitationId,
        };
}
